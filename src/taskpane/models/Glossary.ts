import { IGlossary, IGlossaryItem, IGlossaryStore } from "../types/glossary";

export class Language {
  name: string;
  abbreviation: string;
  order: number;

  constructor(name: string, abbreviation: string, order: number) {
    this.name = name;
    this.abbreviation = abbreviation;
    this.order = order;
  }
}

export class Glossary implements IGlossary {
  id: string;
  source: Language;
  target: Language;
  created: Date;
  items: IGlossaryItem[];

  constructor(source: Language, target: Language) {
    this.id = `${source.abbreviation}-${target.abbreviation}`;
    this.source = source;
    this.target = target;
    this.created = new Date();
  }

  deleteItem(word: string) {
    let delIndex = this.items.findIndex(item => item.original === word);
    this.items.splice(delIndex, 1);
  }

  addItem(newItem: IGlossaryItem) {
    if (!newItem) {
      throw new Error("Item should not be empty!");
    }
    this.items.push(newItem);
  }

  editItem(word: string, newTranslation: string, newNote?: string) {
    let prevWord = this.items.find(it => it.original === word);
    if (!!prevWord) {
      prevWord.translation = newTranslation;
      prevWord.note = newNote;
    }
  }
}
