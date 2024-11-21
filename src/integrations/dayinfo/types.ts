type Day = {
  datum: string;
  veckodag: string;
  "arbetsfri dag": "Ja" | "Nej";
  "röd dag": "Ja" | "Nej";
  vecka: string;
  "dag i vecka": string;
  namnsdag: string[];
  flaggdag: string;
};

export interface DayResponse {
  cachetid: string;
  version: string;
  uri: string;
  startdatum: string;
  slutdatum: string;
  dagar: Day[];
}

type Gender = "male" | "female";

export interface NameResponse {
  status: boolean;
  remaining_credits: number;
  gender: Gender;
  name: string;
}

type NameDay = {
  name: string;
  gender: Gender;
};

export type Data = {
  birthday: string | null;
  names: NameDay[];
  flag: boolean;
  red: boolean;
};
