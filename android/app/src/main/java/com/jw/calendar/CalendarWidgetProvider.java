package com.jw.calendar;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class CalendarWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // Aggiorna tutti i widget
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        // Gestisci refresh manuale
        if ("com.jw.calendar.WIDGET_REFRESH".equals(intent.getAction())) {
            android.util.Log.d("CalendarWidget", "Manual refresh triggered");
            
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(
                new android.content.ComponentName(context, CalendarWidgetProvider.class)
            );
            onUpdate(context, appWidgetManager, appWidgetIds);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_calendar);

        // Leggi il tema dalle SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String settingsJson = prefs.getString("calendar4jw_settings", "{}");
        String theme = "dark"; // default
        try {
            JSONObject settings = new JSONObject(settingsJson);
            theme = settings.optString("theme", "dark");
        } catch (Exception e) {
            android.util.Log.e("CalendarWidget", "Error parsing settings", e);
        }

        // Imposta colori e background in base al tema
        int backgroundColor, textColor, secondaryTextColor, accentColor;
        if ("light".equals(theme)) {
            views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_background);
            textColor = 0xFF333333;
            secondaryTextColor = 0xFF666666;
            accentColor = 0xFF4285F4;
        } else {
            views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_background_dark);
            textColor = 0xFFEEEEEE;
            secondaryTextColor = 0xFFAAAAAA;
            accentColor = 0xFF4285F4;
        }

        views.setTextColor(R.id.widget_date, textColor);
        views.setTextColor(R.id.widget_events_text, secondaryTextColor);
        views.setTextColor(R.id.widget_next_event, secondaryTextColor);
        views.setTextColor(R.id.widget_open_app, accentColor);

        // Imposta la data corrente
        SimpleDateFormat dateFormat = new SimpleDateFormat("d MMMM yyyy", Locale.ITALIAN);
        String currentDate = dateFormat.format(new Date());
        views.setTextViewText(R.id.widget_date, currentDate);

        // Carica eventi di oggi e crea testo
        String eventsText = getEventsText(context);
        views.setTextViewText(R.id.widget_events_text, eventsText);

        // Mostra prossimo evento
        String nextEvent = getNextEvent(context);
        if (nextEvent != null && !nextEvent.isEmpty()) {
            views.setTextViewText(R.id.widget_next_event, nextEvent);
            views.setViewVisibility(R.id.widget_next_event, android.view.View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.widget_next_event, android.view.View.GONE);
        }

        // Intent per aprire l'app
        Intent openAppIntent = new Intent(context, MainActivity.class);
        PendingIntent openAppPendingIntent = PendingIntent.getActivity(
            context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_open_app, openAppPendingIntent);

        // Intent per refresh
        Intent refreshIntent = new Intent(context, CalendarWidgetProvider.class);
        refreshIntent.setAction("com.jw.calendar.WIDGET_REFRESH");
        PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(
            context, 0, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_refresh, refreshPendingIntent);

        // Aggiorna il widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static String getEventsText(Context context) {
        try {
            // Capacitor Preferences salva in CapacitorStorage
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String eventsJson = prefs.getString("widget_events", "[]");
            
            android.util.Log.d("CalendarWidget", "getEventsText - Reading from CapacitorStorage");
            android.util.Log.d("CalendarWidget", "Events JSON length: " + eventsJson.length());
            android.util.Log.d("CalendarWidget", "Events JSON: " + eventsJson.substring(0, Math.min(300, eventsJson.length())));
            
            if (eventsJson == null || eventsJson.equals("[]") || eventsJson.isEmpty()) {
                android.util.Log.d("CalendarWidget", "No events found in SharedPreferences");
                return "Nessun evento oggi";
            }
            
            JSONArray eventsArray = new JSONArray(eventsJson);
            android.util.Log.d("CalendarWidget", "Parsed " + eventsArray.length() + " events from JSON");
            
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            String today = dateFormat.format(new Date());
            android.util.Log.d("CalendarWidget", "Today's date: " + today);
            
            StringBuilder sb = new StringBuilder();
            int eventCount = 0;
            
            for (int i = 0; i < eventsArray.length(); i++) {
                try {
                    JSONObject event = eventsArray.getJSONObject(i);
                    String eventDate = event.optString("date", "");
                    
                    android.util.Log.d("CalendarWidget", "Event " + i + ": date=" + eventDate + ", title=" + event.optString("title", ""));
                    
                    // Eventi di oggi
                    if (today.equals(eventDate)) {
                        if (eventCount > 0) sb.append("\n\n");
                        
                        String title = event.optString("title", "Evento");
                        String startTime = event.optString("startTime", "");
                        String endTime = event.optString("endTime", "");
                        
                        if (!startTime.isEmpty() && !endTime.isEmpty()) {
                            sb.append("🕐 ").append(startTime).append(" - ").append(endTime).append("\n");
                        } else if (!startTime.isEmpty()) {
                            sb.append("🕐 ").append(startTime).append("\n");
                        }
                        
                        sb.append(title);
                        eventCount++;
                        android.util.Log.d("CalendarWidget", "Added event to widget: " + title);
                    }
                    
                    // Eventi multi-giorno
                    String endDate = event.optString("endDate", "");
                    if (!endDate.isEmpty() && eventDate.compareTo(today) <= 0 && today.compareTo(endDate) <= 0) {
                        if (!today.equals(eventDate)) {
                            if (eventCount > 0) sb.append("\n\n");
                            sb.append("📅 Tutto il giorno\n");
                            sb.append(event.optString("title", "Evento"));
                            eventCount++;
                            android.util.Log.d("CalendarWidget", "Added multi-day event: " + event.optString("title", ""));
                        }
                    }
                } catch (Exception e) {
                    android.util.Log.e("CalendarWidget", "Error processing event " + i, e);
                    continue;
                }
            }
            
            android.util.Log.d("CalendarWidget", "Total events for today: " + eventCount);
            
            if (eventCount == 0) {
                return "Nessun evento oggi";
            }
            
            return sb.toString();
            
        } catch (Exception e) {
            android.util.Log.e("CalendarWidget", "Error in getEventsText", e);
            e.printStackTrace();
            return "Errore caricamento eventi";
        }
    }

    private static String getNextEvent(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String eventsJson = prefs.getString("widget_events", "[]");
            
            if (eventsJson == null || eventsJson.equals("[]") || eventsJson.isEmpty()) {
                return null;
            }
            
            JSONArray eventsArray = new JSONArray(eventsJson);
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            SimpleDateFormat dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
            Date now = new Date();
            
            // Trova il prossimo evento (oggi dopo l'orario corrente o futuro)
            JSONObject nextEvent = null;
            long minTimeDiff = Long.MAX_VALUE;
            
            for (int i = 0; i < eventsArray.length(); i++) {
                try {
                    JSONObject event = eventsArray.getJSONObject(i);
                    String eventDate = event.optString("date", "");
                    String startTime = event.optString("startTime", "");
                    
                    // Considera solo eventi futuri
                    Date eventDateTime;
                    if (!startTime.isEmpty()) {
                        eventDateTime = dateTimeFormat.parse(eventDate + " " + startTime);
                    } else {
                        eventDateTime = dateFormat.parse(eventDate);
                    }
                    
                    if (eventDateTime != null && eventDateTime.after(now)) {
                        long timeDiff = eventDateTime.getTime() - now.getTime();
                        if (timeDiff < minTimeDiff) {
                            minTimeDiff = timeDiff;
                            nextEvent = event;
                        }
                    }
                } catch (Exception e) {
                    continue;
                }
            }
            
            if (nextEvent != null) {
                String title = nextEvent.optString("title", "Evento");
                String startTime = nextEvent.optString("startTime", "");
                String eventDate = nextEvent.optString("date", "");
                
                // Formatta la data
                SimpleDateFormat displayDateFormat = new SimpleDateFormat("d MMM", Locale.ITALIAN);
                Date eventDateObj = dateFormat.parse(eventDate);
                String displayDate = displayDateFormat.format(eventDateObj);
                
                // Calcola giorni mancanti
                long days = minTimeDiff / (1000 * 60 * 60 * 24);
                
                StringBuilder sb = new StringBuilder("📌 Prossimo: ");
                if (days == 0) {
                    sb.append("Oggi ");
                } else if (days == 1) {
                    sb.append("Domani ");
                } else {
                    sb.append(displayDate).append(" ");
                }
                
                if (!startTime.isEmpty()) {
                    sb.append(startTime).append(" - ");
                }
                sb.append(title);
                
                return sb.toString();
            }
            
            return null;
            
        } catch (Exception e) {
            android.util.Log.e("CalendarWidget", "Error in getNextEvent", e);
            return null;
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Primo widget aggiunto
    }

    @Override
    public void onDisabled(Context context) {
        // Ultimo widget rimosso
    }
}
