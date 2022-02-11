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
