export type Period = "month" | "week" | "day";
export type Status = "urgent" | "close" | "normal";

export interface Chore {
  id: string;
  summary: string;
  start: number;
  year: number;
  month: number;
  week: number;
  period: Period;
  status: Status;
}
