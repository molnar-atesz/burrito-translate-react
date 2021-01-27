import { Language } from "../models/Glossary";

export interface IGlossaryItem {
  key: string;
  original: string;
  translation: string;
  note?: string;
}

export interface IGlossary {
  id: string;
  source: Language;
  target: Language;
  created: Date;
  items: IGlossaryItem[];

  load(): any;
  save(): any;
  deleteItem(word: string): any;
  addItem(newItem: IGlossaryItem): any;
  editItem(word: string, newTranslation: string, newNote?: string): any;
}
