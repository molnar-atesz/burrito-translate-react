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

  constructor(source: Language, target: Language, created?: Date) {
    this.id = `${source.abbreviation}-${target.abbreviation}`;
    this.source = source;
    this.target = target;
    this.created = !!created ? created : new Date();
    this.items = [];
  }

  deleteItem(word: string) {
    let delIndex = this.items.findIndex(item => item.original === word);
    this.items.splice(delIndex, 1);
  }

  addItem(newItem: IGlossaryItem) {
    if (!newItem) {
      throw new Error("Item should not be empty!");
    }

    if (!!this.items.find(it => it.original === newItem.original)) {
      throw new Error(`Already contains word '${newItem.original}'.`);
    }
    newItem.key = (this.items.length + 1).toString();
    this.items.push(newItem);
  }

  addRange(newItems: IGlossaryItem[]) {
    if (!newItems) {
      throw new Error("Invalid argument: 'newItems' is required");
    }

    newItems.forEach(newItem => {
      this.addItem(newItem);
    });
  }

  editItem(word: string, newTranslation: string, newNote?: string) {
    if (!newTranslation) {
      throw new Error("Invalid argument: 'newTranslation' is required");
    }

    let item = this.items.find(it => it.original === word);
    if (!item) {
      throw new Error(`Invalid argument: '${word}' is not an existing word`);
    }

    item.translation = newTranslation;
    item.note = newNote;
  }

  clear(): void {
    this.items.length = 0;
  }
}
