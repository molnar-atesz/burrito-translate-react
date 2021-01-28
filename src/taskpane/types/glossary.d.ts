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

export interface IGlossaryStore {
  saveAsync(glossary: IGlossary): Promise<string>;
  loadAsync(id: string): Promise<IGlossary>;
  clearAsync(id: string): Promise<void>;
}

export interface IGlossaryXmlSerializer {
  serialize(glossary: IGlossary): string;
  deserialize(xml: string): IGlossary;
}

export interface IDocumentCustomXmlProxy {
  getXmlPartByIdAsync(id: string): Promise<Office.AsyncResult<Office.CustomXmlPart>>;
  getXmlValueAsync(xmlPart: Office.CustomXmlPart): Promise<string>;
}
