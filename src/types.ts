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

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

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
] as const;

export type TopicCode = (typeof TOPIC_CODES)[number];

export interface CardProgress {
  level: CEFRLevel;
  wordId: number;
  reps: number;
  interval: number;
  easeFactor: number;
  dueDate: string;
}
