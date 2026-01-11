export interface WidgetSyncPlugin {
  updateWidgetData(options: { events: string }): Promise<{ success: boolean; widgetsUpdated: number }>;
  hasWidgets(): Promise<{ hasWidgets: boolean; widgetCount: number }>;
}
