import { IGlossary, IGlossaryItem, ISearchOptions } from "../types/glossary";
import { Language } from "./Language";

export class Glossary implements IGlossary {
  private _id: string;
  private _source: Language;
  private _target: Language;
  private _created: Date;
  private _items: IGlossaryItem[];

  constructor(source: Language, target: Language, created?: Date) {
    this._id = `${source.abbreviation}-${target.abbreviation}`;
    this._source = source;
    this._target = target;
    this._created = !!created ? created : new Date();
    this._items = [];
  }

  public get id(): string {
    return this._id;
  }

  public get source(): Language {
    return this._source;
  }

  public get target(): Language {
    return this._target;
  }

  public get created(): Date {
    return this._created;
  }

  public get items() {
    return [...this._items];
  }

  public deleteItem(word: string) {
    let delIndex = this._items.findIndex(item => item.original === word);
    if (delIndex === -1) {
      throw new Error(`Not found: '${word}'`);

    }
    this._items.splice(delIndex, 1);
  }

  public addItem(newItem: IGlossaryItem) {
    if (!newItem) {
      throw new Error("Invalid argument: 'newItem' is required");
    }

    if (newItem.original.length == 0) {
      throw new Error("Original word should not be empty!");
    }

    newItem.key = (this._items.length + 1).toString();
    this._items.push(newItem);
  }

  public addRange(newItems: IGlossaryItem[]) {
    if (!newItems) {
      throw new Error("Invalid argument: 'newItems' is required");
    }

    newItems.forEach(newItem => {
      try {
        this.addItem(newItem);
      } catch (error) {
        console.info(error.message);
      }
    });
  }

  public editItem(word: string, newTranslation: string, newNote?: string) {
    if (!newTranslation) {
      throw new Error("Invalid argument: 'newTranslation' is required");
    }

    let item = this._items.find(it => it.original === word);
    if (!item) {
      throw new Error(`Invalid argument: '${word}' is not an existing word`);
    }

    item.translation = newTranslation;
    item.note = newNote;
  }

  public clear(): void {
    this._items.length = 0;
  }

  public search(keyword: string, searchOptions?: ISearchOptions): IGlossaryItem[] {
    searchOptions = {
      caseSensitive: searchOptions?.caseSensitive ?? false,
      wholeWord: searchOptions?.wholeWord ?? false
    };
    const result = this._items.filter(item => {
      let flags = searchOptions.caseSensitive ? "gm" : "gmi";
      let pattern = searchOptions.wholeWord ? `\\b${keyword}\\b` : keyword;
      let regex = new RegExp(pattern, flags);

      return regex.test(item.original) || regex.test(item.translation);
    });
    return [...result];
  }
}
