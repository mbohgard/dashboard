export type Period = "month" | "week" | "day";

export interface Chore {
  id: string;
  summary: string;
  description: string;
  start: number;
  year: number;
  month: number;
  week: number;
  date: number;
  period: Period;
}
