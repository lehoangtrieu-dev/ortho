export interface DictionaryEntry {
  id: number;
  w: string;
  ipa: string;
  pron: string;
  s: Sense[];
  col: string[];
}

export interface Sense {
  pos: string;
  defn: string;
  syn: string[];
  ant: string[];
  ex: string[];
}

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface CardProgress {
  level: CEFRLevel;
  wordId: number;
  senseId: number;
  reps: number;
  interval: number;
  easeFactor: number;
  dueDate: string;
}
