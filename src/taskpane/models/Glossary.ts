import { IGlossary, IGlossaryItem } from "../types/glossary";

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

  load() {
    throw new Error("Method not implemented.");
  }

  save() {
    throw new Error("Method not implemented.");
  }

  deleteItem(word: string) {
    throw new Error("Method not implemented." + word);
  }

  addItem(newItem: IGlossaryItem) {
    throw new Error("Method not implemented." + newItem.original);
  }

  editItem(word: string, newTranslation: string, newNote?: string) {
    let temp = word + newTranslation + newNote;
    throw new Error("Method not implemented.") + temp;
  }
}
