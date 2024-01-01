export interface CalendarEvent {
  allDay: boolean;
  color: import("../../../../src/styles").Colors;
  end: number;
  id: string;
  name: string;
  now: number;
  ongoing: boolean;
  passed: boolean;
  start: number;
  summary: string;
}
