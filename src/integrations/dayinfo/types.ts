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

export interface NamsorApiBody {
  personalNames: Array<{
    id: string;
    firstName: string;
    countryIso2: string;
  }>;
}

export type Gender = "male" | "female";

interface PersonalName {
  script: string;
  id: string;
  firstName: string;
  lastName: string;
  likelyGender: Gender;
  genderScale: number;
  score: number;
  probabilityCalibrated: number;
}

export interface NamsorApiResponse {
  personalNames: PersonalName[];
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
