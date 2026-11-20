export interface CalendarEvent {
  allDay: boolean;
  color: import("../../styles.ts").Colors;
  end: number;
  id: string;
  name: string;
  now: number;
  ongoing: boolean;
  passed: boolean;
  start: number;
  summary: string;
  description: string;
}
