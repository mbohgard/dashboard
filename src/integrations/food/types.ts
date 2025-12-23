export interface ApiResponse {
  id: string;
  name: string;
  numberOfItems: number;
  WeekState: WeekState;
  Bulletin: any | null;
  School: School;
}

export interface WeekState {
  id: string;
  oldId: string | null;
  state: number;
  week: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  menuId: string;
  Days: Day[];
  urlNames: string[];
}

export interface Day {
  id: string;
  oldId: string | null;
  cancelled: boolean | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  menuId: string;
  weekStateId: string;
  Meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  dayId: string;
  mealAttributeIds: string[];
  MealAttributes: MealAttribute[];
}

export interface MealAttribute {
  // Placeholder – empty in your data
  [key: string]: any;
}

export interface School {
  id: string;
  name: string;
  urlName: string;
  image: BufferImage | null;
  District: District;
}

export interface District {
  id: string;
  name: string;
  urlName: string;
  image: BufferImage | null;
}

export interface BufferImage {
  type: "Buffer";
  data: number[];
}
