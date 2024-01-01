type FoodDay = (
  | {
      meals: Array<{
        value: string;
      }>;
    }
  | {
      reason: string;
    }
) & {
  month: number;
  day: number;
  year: number;
};

interface FoodWeek {
  days: FoodDay[];
  weekOfYear: number;
  year: number;
}

export interface ApiResponse {
  menu: {
    weeks: FoodWeek[];
  };
}
