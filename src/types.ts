export interface DictionaryEntry {
  id: number;
  w: string;
  level: CEFRLevel;
  ipa: string;
  top: TopicCode[];
  col: string[];
  pos: string;
  pat: string;
  defn: string;
  syn: string[];
  ex: string[];
}

export interface CardProgress {
  level: CEFRLevel;
  wordId: number;
  reps: number;
  interval: number;
  easeFactor: number;
  dueDate: string;
}

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type TopicCode = (typeof TOPIC_CODES)[number];

export const TOPIC_CODES = [
  "EDU",
  "ENV",
  "HEA",
  "COM",
  "TEC",
  "BUS",
  "SOC",
  "CUL",
  "ART",
  "LAW",
  "DAT",
  "COH",
] as const;

export const TOPIC_MAPPING = {
  EDU: "Education & Learning",
  ENV: "Environment & Nature",
  HEA: "Health & Fitness",
  COM: "Media & Communication",
  TEC: "Technology & Science",
  BUS: "Work & Business",
  SOC: "Society & Social Issues",
  CUL: "Travel, Tourism & Culture",
  ART: "Art & Architecture",
  LAW: "Government & Law",
  DAT: "Data & Trends",
  COH: "Discourse & Cohesion",
};
