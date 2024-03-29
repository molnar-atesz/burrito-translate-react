import { Language } from "../models/Language";

export const LANGUAGES = [
  new Language("English", "en", 1),
  new Language("Magyar", "hu", 2),
  new Language("Deutsche", "de", 3),
  new Language("Française", "fr", 4),
  new Language("Española", "es", 5),
  new Language("Portugues", "pt", 6),
  new Language("Pусский", "ru", 7),
  new Language("italiana", "it", 8)
];

export const VERTICAL_STACK_TOKENS = {
  childrenGap: 5
};

export const XMLNS = "http://burrito.org/translate";
export const ID_SETTINGS_KEY = "BurritoMemory";
