import { IGlossary, IGlossaryItem } from "../types/glossary";
import { Glossary, Language } from "./Glossary";

describe("Glossary", () => {
  describe("constructor", () => {
    let glossary: IGlossary;
    const english = new Language("English", "en", 1);
    const hungarian = new Language("Magyar", "hu", 2);

    beforeEach(() => {
      glossary = new Glossary(english, hungarian);
    });

    test("should set Id based on source and target language abbreviation", () => {
      expect(glossary.id).toBe("en-hu");
    });

    test("should set source properly", () => {
      expect(glossary.source).toBe(english);
    });

    test("should set target properly", () => {
      expect(glossary.target).toBe(hungarian);
    });

    test("should initialize items as empty", () => {
      expect(glossary.items).toBeDefined();
      expect(glossary.items.length).toBe(0);
    });
  });

  describe("addItem", () => {
    let glossary: IGlossary;
    const russian = new Language("Russian", "ru", 1);
    const hungarian = new Language("Magyar", "hu", 2);

    beforeEach(() => {
      glossary = new Glossary(russian, hungarian);
    });

    test("should add item at the end of items list", () => {
      const item: IGlossaryItem = { key: "a", original: "husk", translation: "dog", note: "no" };
      glossary.addItem(item);
      expect(glossary.items).toContain(item);
    });

    test("should throw error on undefined parameter", () => {
      expect(() => glossary.addItem(undefined)).toThrow("Item should not be empty!");
    });

    test("should throw error if 'original' is empty string", () => {
      let item1: IGlossaryItem = { key: "a", original: "", translation: "dog", note: "no" };
      expect(() => glossary.addItem(item1)).toThrow("Original word should not be empty!");
    });

    test("should add word even if it is duplicataed", () => {
      let item1: IGlossaryItem = { key: "a", original: "husk", translation: "dog", note: "no" };
      let item2: IGlossaryItem = { key: "a", original: "husk", translation: "dog", note: "no" };

      glossary.addItem(item1);
      glossary.addItem(item2);

      expect(glossary.items).toContain(item1);
      expect(glossary.items).toContain(item2);
    });
  });

  describe("editItem", () => {
    let glossary: IGlossary;
    const russian = new Language("Russian", "ru", 1);
    const hungarian = new Language("Magyar", "hu", 2);

    beforeEach(() => {
      glossary = new Glossary(russian, hungarian);
    });

    test("should change translation and note of passed word", () => {
      const word = "husk";
      let item: IGlossaryItem = { key: "a", original: word, translation: "dog", note: "no" };
      glossary.addItem(item);
      const changedTranslationValue = "new translation value";
      const changedNoteValue = "some note";

      glossary.editItem(word, changedTranslationValue, changedNoteValue);
      const storedItem: IGlossaryItem = glossary.items.find(i => i.original === word);

      expect(storedItem.translation).toBe(changedTranslationValue);
      expect(storedItem.note).toBe(changedNoteValue);
    });

    test("should throw error on not existing word", () => {
      expect(() => glossary.editItem("not-existing-word", "translation", null)).toThrow(
        "Invalid argument: 'not-existing-word' is not an existing word"
      );
    });

    test("should throw error on undefined translation", () => {
      const word = "husk";
      let item: IGlossaryItem = { key: "a", original: word, translation: "dog", note: "no" };
      glossary.addItem(item);

      expect(() => glossary.editItem(word, undefined)).toThrow("Invalid argument: 'newTranslation' is required");
    });
  });

  describe("addRange", () => {
    let glossary: IGlossary;
    const russian = new Language("Russian", "ru", 1);
    const hungarian = new Language("Magyar", "hu", 2);

    beforeEach(() => {
      glossary = new Glossary(russian, hungarian);
    });

    test("should add all items from passed array", () => {
      const items: IGlossaryItem[] = [
        { key: "a", original: "husk", translation: "dog", note: "no" },
        { key: "b", original: "test", translation: "teszt", note: "" },
        { key: "c", original: "word", translation: "szo" }
      ];
      glossary.addRange(items);
      expect(glossary.items).toContain(items[0]);
      expect(glossary.items).toContain(items[1]);
      expect(glossary.items).toContain(items[2]);
    });

    test("should skip empty words", () => {
      const empty = { key: "c", original: "", translation: "szo" };
      const items: IGlossaryItem[] = [
        { key: "a", original: "husk", translation: "dog", note: "no" },
        { key: "b", original: "test", translation: "teszt", note: "" }
      ];
      items.push(empty);

      glossary.addRange(items);

      expect(glossary.items).not.toContain(empty);
    });

    test("should throw error on undefined parameter", () => {
      expect(() => glossary.addRange(undefined)).toThrow("Invalid argument: 'newItems' is required");
    });
  });

  describe("clear", () => {
    let glossary: IGlossary;
    const russian = new Language("Russian", "ru", 1);
    const hungarian = new Language("Magyar", "hu", 2);

    beforeEach(() => {
      glossary = new Glossary(russian, hungarian);
      const items: IGlossaryItem[] = [
        { key: "a", original: "husk", translation: "dog", note: "no" },
        { key: "b", original: "test", translation: "teszt", note: "" },
        { key: "c", original: "word", translation: "szo" }
      ];
      glossary.addRange(items);
    });

    test("should remove all previously added items", () => {
      glossary.clear();
      expect(glossary.items.length).toEqual(0);
    });

    test("should throw error on undefined parameter", () => {
      expect(() => glossary.addRange(undefined)).toThrow("Invalid argument: 'newItems' is required");
    });
  });

  describe("search", () => {
    let glossary: IGlossary;
    const english = new Language("English", "en", 1);
    const hungarian = new Language("Magyar", "hu", 2);

    beforeEach(() => {
      glossary = new Glossary(english, hungarian);
      const items: IGlossaryItem[] = [
        { key: "1", original: "SensitivE", translation: "ÉrzékenY", note: "no" },
        { key: "2", original: "nOn sEnsItIve", translation: "nEm ÉrzÉkEny" },
        { key: "3", original: "whole word", translation: "teljes szo" },
        { key: "4", original: "notwhole word", translation: "nemteljes szo" },
        { key: "5", original: "Whole Sensitive", translation: "Teljes Érzékeny" },
        { key: "6", original: "NotWhole Sensitive", translation: "NemTeljes Érzékeny" }
      ];
      glossary.addRange(items);
    });

    test("should return all item if search expression is empty", () => {
      const searchExpression = "";

      const result = glossary.search(searchExpression);

      expect(result).toEqual(glossary.items);
    });

    test("should return empty list if the search keyword not found", () => {
      const keyword = "there-is-no-such-word";

      const result = glossary.search(keyword);

      expect(result).toEqual([]);
    });

    test("should find words in original case insensitively without option", () => {
      const searchExpression = "non sensitive";
      const expectedResult = [{ key: "2", original: "nOn sEnsItIve", translation: "nEm ÉrzÉkEny" }];

      const result = glossary.search(searchExpression);

      expect(result).toEqual(expectedResult);
    });

    test("should find words in translation case insensitively without option", () => {
      const searchExpression = "nem érzékeny";
      const expectedResult = [{ key: "2", original: "nOn sEnsItIve", translation: "nEm ÉrzÉkEny" }];

      const result = glossary.search(searchExpression);

      expect(result).toEqual(expectedResult);
    });

    test("should find words in original case sensitively if search option set", () => {
      const searchExpression = "SensitivE";
      const matches = [{ key: "1", original: "SensitivE", translation: "ÉrzékenY", note: "no" }];
      const searchOptions = {
        caseSensitive: true
      };

      const result = glossary.search(searchExpression, searchOptions);

      expect(result).toEqual(matches);
    });

    test("should find words in translation case sensitively if search option set", () => {
      const searchExpression = "ÉrzékenY";
      const expectedResult = [{ key: "1", original: "SensitivE", translation: "ÉrzékenY", note: "no" }];
      const searchOptions = {
        caseSensitive: true
      };

      const result = glossary.search(searchExpression, searchOptions);

      expect(result).toEqual(expectedResult);
    });

    test("should find only whole words in original case insensitively when options set", () => {
      const searchExpression = "whole";
      const expectedResult = [
        { key: "3", original: "whole word", translation: "teljes szo" },
        { key: "5", original: "Whole Sensitive", translation: "Teljes Érzékeny" }
      ];
      const searchOptions = {
        wholeWord: true
      };

      const result = glossary.search(searchExpression, searchOptions);

      expect(result).toEqual(expectedResult);
    });

    test("should find only whole words in translation case insensitively when options set", () => {
      const searchExpression = "teljes";
      const expectedResult = [
        { key: "3", original: "whole word", translation: "teljes szo" },
        { key: "5", original: "Whole Sensitive", translation: "Teljes Érzékeny" }
      ];
      const searchOptions = {
        wholeWord: true
      };

      const result = glossary.search(searchExpression, searchOptions);

      expect(result).toEqual(expectedResult);
    });

    test("should find only case sensitive whole words in original when options set", () => {
      const searchExpression = "Whole";
      const expectedResult = [{ key: "5", original: "Whole Sensitive", translation: "Teljes Érzékeny" }];
      const searchOptions = {
        caseSensitive: true,
        wholeWord: true
      };

      const result = glossary.search(searchExpression, searchOptions);

      expect(result).toEqual(expectedResult);
    });

    test("should find only case sensitive whole words in translation when options set", () => {
      const searchExpression = "Teljes";
      const expectedResult = [{ key: "5", original: "Whole Sensitive", translation: "Teljes Érzékeny" }];
      const searchOptions = {
        caseSensitive: true,
        wholeWord: true
      };

      const result = glossary.search(searchExpression, searchOptions);

      expect(result).toEqual(expectedResult);
    });
  });
});
