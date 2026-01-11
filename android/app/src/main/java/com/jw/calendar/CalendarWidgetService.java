package com.jw.calendar;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class CalendarWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new CalendarRemoteViewsFactory(this.getApplicationContext(), intent);
    }
}

class CalendarRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {
    private Context context;
    private int appWidgetId;
    private List<EventItem> events = new ArrayList<>();

    public CalendarRemoteViewsFactory(Context context, Intent intent) {
        this.context = context;
        this.appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID);
    }

    @Override
    public void onCreate() {
        // Inizializzazione
    }

    @Override
    public void onDataSetChanged() {
        // Carica eventi da localStorage (SharedPreferences nella app WebView)
        events.clear();
        
        try {
            // Leggi eventi da Capacitor Storage (se accessibile)
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String eventsJson = prefs.getString("events", "[]");
            
            if (eventsJson == null || eventsJson.equals("[]") || eventsJson.isEmpty()) {
                // Nessun dato, lascia la lista vuota
                return;
            }
            
            JSONArray eventsArray = new JSONArray(eventsJson);
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            String today = dateFormat.format(new Date());
            
            for (int i = 0; i < eventsArray.length(); i++) {
                try {
                    JSONObject event = eventsArray.getJSONObject(i);
                    String eventDate = event.optString("date", "");
                    
                    // Mostra solo eventi di oggi
                    if (today.equals(eventDate)) {
                        EventItem item = new EventItem();
                        item.title = event.optString("title", "Evento");
                        item.startTime = event.optString("startTime", "");
                        item.endTime = event.optString("endTime", "");
                        item.color = event.optString("color", "#4285F4");
                        events.add(item);
                    }
                    
                    // Gestisci eventi multi-giorno
                    String endDate = event.optString("endDate", "");
                    if (!endDate.isEmpty() && eventDate.compareTo(today) <= 0 && today.compareTo(endDate) <= 0) {
                        if (!today.equals(eventDate)) { // evita duplicati
                            EventItem item = new EventItem();
                            item.title = event.optString("title", "Evento");
                            item.startTime = "Tutto il giorno";
                            item.endTime = "";
                            item.color = event.optString("color", "#4285F4");
                            events.add(item);
                        }
                    }
                } catch (Exception eventException) {
                    // Salta evento con errori
                    continue;
                }
            }
            
            // Ordina per ora (compatibile con API < 24)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                events.sort((a, b) -> {
                    if (a.startTime.isEmpty()) return 1;
                    if (b.startTime.isEmpty()) return -1;
                    return a.startTime.compareTo(b.startTime);
                });
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            // In caso di errore, lascia la lista vuota
            events.clear();
        }
    }

    @Override
    public void onDestroy() {
        events.clear();
    }

    @Override
    public int getCount() {
        return events.isEmpty() ? 1 : events.size(); // Mostra almeno 1 riga
    }

    @Override
    public RemoteViews getViewAt(int position) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_event_item);

        if (events.isEmpty()) {
            // Nessun evento oggi
            views.setTextViewText(R.id.event_title, "Nessun evento oggi");
            views.setTextViewText(R.id.event_time, "");
            views.setInt(R.id.event_color, "setBackgroundColor", Color.parseColor("#CCCCCC"));
        } else {
            EventItem event = events.get(position);
            views.setTextViewText(R.id.event_title, event.title);
            
            String timeText = "";
            if (!event.startTime.isEmpty() && !event.endTime.isEmpty()) {
                timeText = event.startTime + " - " + event.endTime;
            } else if (!event.startTime.isEmpty()) {
                timeText = event.startTime;
            }
            views.setTextViewText(R.id.event_time, timeText);
            
            try {
                views.setInt(R.id.event_color, "setBackgroundColor", Color.parseColor(event.color));
            } catch (Exception e) {
                views.setInt(R.id.event_color, "setBackgroundColor", Color.parseColor("#4285F4"));
            }

            // Intent per click sull'evento
            Intent fillInIntent = new Intent();
            fillInIntent.putExtra("eventDate", event.title);
            views.setOnClickFillInIntent(R.id.event_title, fillInIntent);
        }

        return views;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 1;
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }

    static class EventItem {
        String title;
        String startTime;
        String endTime;
        String color;
    }
}
