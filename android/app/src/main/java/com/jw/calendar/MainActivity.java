package com.jw.calendar;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebView;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.os.Build;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(GoogleAuth.class);
    registerPlugin(WidgetSyncPlugin.class);
    
    // Enable WebView debugging for Chrome DevTools
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      WebView.setWebContentsDebuggingEnabled(true);
    }
    
    // Configure status bar to be transparent with dark icons
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      Window window = getWindow();
      window.setStatusBarColor(android.graphics.Color.TRANSPARENT);
      
      // Set dark icons on status bar
      View decorView = window.getDecorView();
      int flags = decorView.getSystemUiVisibility();
      flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
      decorView.setSystemUiVisibility(flags);
    }
  }
}
