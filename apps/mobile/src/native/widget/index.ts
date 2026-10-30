export interface WidgetDataPayload {
  dueTodayCount: number;
  overdueCount: number;
  nearestTasks: Array<{
    id: string;
    title: string;
    isDone: boolean;
  }>;
  accent: string;
  theme: 'light' | 'dark';
}

export class WidgetService {
  private lastPayload: WidgetDataPayload | null = null;

  public async updateWidgetData(data: WidgetDataPayload): Promise<void> {
    this.lastPayload = data;
    // Writes to shared preferences / App Group storage for Glance & WidgetKit
  }

  public async refreshWidget(): Promise<void> {
    // Triggers widget reload
  }

  public getCachedData(): WidgetDataPayload | null {
    return this.lastPayload;
  }
}

export const widgetService = new WidgetService();
