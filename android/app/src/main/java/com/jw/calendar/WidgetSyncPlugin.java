package com.jw.calendar;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetSync")
public class WidgetSyncPlugin extends Plugin {

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        String eventsJson = call.getString("events", "[]");
        
        android.util.Log.d("WidgetSync", "updateWidgetData called with " + eventsJson.length() + " chars");
        android.util.Log.d("WidgetSync", "Events data: " + eventsJson.substring(0, Math.min(200, eventsJson.length())));
        
        // Salva in SharedPreferences condivise
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("events", eventsJson);
        boolean saved = editor.commit(); // commit sincrono invece di apply
        
        android.util.Log.d("WidgetSync", "Saved to SharedPreferences: " + saved);
        
        // Verifica che sia stato salvato
        String readBack = prefs.getString("events", "[]");
        android.util.Log.d("WidgetSync", "Read back from SharedPreferences: " + readBack.length() + " chars");
        
        // Aggiorna tutti i widget
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(
            new ComponentName(context, CalendarWidgetProvider.class)
        );
        
        android.util.Log.d("WidgetSync", "Found " + appWidgetIds.length + " widgets to update");
        
        if (appWidgetIds.length > 0) {
            for (int appWidgetId : appWidgetIds) {
                CalendarWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId);
            }
        }
        
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("widgetsUpdated", appWidgetIds.length);
        call.resolve(ret);
    }

    @PluginMethod
    public void hasWidgets(PluginCall call) {
        Context context = getContext();
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(
            new ComponentName(context, CalendarWidgetProvider.class)
        );
        
        JSObject ret = new JSObject();
        ret.put("hasWidgets", appWidgetIds.length > 0);
        ret.put("widgetCount", appWidgetIds.length);
        call.resolve(ret);
    }
}
