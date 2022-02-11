import { MessageBarType } from "office-ui-fabric-react";
import { Language } from "../models/Language";

export interface INotification {
  message: string;
  messageBarType: MessageBarType;
}

export interface IGlossaryItem {
  key?: string;
  original: string;
  translation: string;
  note?: string;
}

export interface ISearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
}

export interface IGlossary {
  id: string;
  source: Language;
  target: Language;
  created: Date;
  items: IGlossaryItem[];

  addItem(newItem: IGlossaryItem): void;
  addRange(items: IGlossaryItem[]): void;
  deleteItem(word: string): void;
  editItem(word: string, newTranslation: string, newNote?: string): void;
  clear(): void;
  search(keyword: string, searchOptions?: ISearchOptions): IGlossaryItem[];
}

export interface IGlossaryStore {
  saveAsync(glossary: IGlossary): Promise<string>;
  loadAsync(): Promise<IGlossary>;
  clearAsync(): Promise<void>;
}

export interface IGlossaryXmlSerializer {
  serialize(glossary: IGlossary): string;
  deserialize(xml: string): IGlossary;
}

export interface IDocCustomXmlProxy {
  getXmlPartByIdAsync(id: string): Promise<Office.AsyncResult<Office.CustomXmlPart>>;
  getXmlValueAsync(xmlPart: Office.CustomXmlPart): Promise<string>;
}
