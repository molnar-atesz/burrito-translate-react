import { IGlossary, IGlossaryItem } from "../types/glossary";
import {
  createEmptyGlossary,
  createGlossaryWithWords,
  english,
  hungarian
} from "../__fixtures__/glossary";
import { Glossary } from "./Glossary";

describe("Glossary", () => {
  describe("constructor", () => {
    let glossary: IGlossary;

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
    test("should add item at the end of items list", () => {
      const glossary = createEmptyGlossary();
      const item: IGlossaryItem = { key: "50", original: "husk", translation: "dog", note: "no" };

      glossary.addItem(item);

      expect(glossary.items).toContain(item);
    });

    test("should throw error on undefined parameter", () => {
      const glossary = createEmptyGlossary();

      const act = () => glossary.addItem(undefined);

      expect(act).toThrow("Item should not be empty!");
    });

    test("should throw error if 'original' is empty string", () => {
      const glossary = createEmptyGlossary();
      let item1: IGlossaryItem = { key: "1", original: "", translation: "dog", note: "no" };

      const act = () => glossary.addItem(item1);

      expect(act).toThrow("Original word should not be empty!");
    });

    test("should add word even if it is duplicated", () => {
      const glossary = createEmptyGlossary();
      let item1: IGlossaryItem = { key: "50", original: "husk", translation: "dog", note: "no" };
      let item2: IGlossaryItem = { key: "51", original: "husk", translation: "dog", note: "no" };

      glossary.addItem(item1);
      glossary.addItem(item2);

      expect(glossary.items).toContain(item1);
      expect(glossary.items).toContain(item2);
    });
  });

  describe("editItem", () => {
    test("should change translation and note of passed word", () => {
      const glossary = createEmptyGlossary();
      const word = "husk";
      let item: IGlossaryItem = {
        key: "1",
        original: word,
        translation: "dog", note: "no"
      };
      glossary.addItem(item);
      const changedTranslationValue = "new translation value";
      const changedNoteValue = "some note";

      glossary.editItem(word, changedTranslationValue, changedNoteValue);
      const storedItem: IGlossaryItem = glossary.items[0];

      expect(storedItem.translation).toBe(changedTranslationValue);
      expect(storedItem.note).toBe(changedNoteValue);
    });

    test("should throw error on not existing word", () => {
      const glossary = createEmptyGlossary();

      const act = () => glossary.editItem("not-existing-word", "translation", null);

      expect(act).toThrow(
        "Invalid argument: 'not-existing-word' is not an existing word"
      );
    });

    test("should throw error on undefined translation", () => {
      const word = "husk";
      const glossary = createEmptyGlossary();
      const item: IGlossaryItem = { key: "1", original: word, translation: "dog", note: "no" };
      glossary.addItem(item);

      const act = () => glossary.editItem(word, undefined);

      expect(act).toThrow(
        "Invalid argument: 'newTranslation' is required"
      );
    });
  });

  describe("addRange", () => {
    test("should add all items from passed array", () => {
      const glossary = createEmptyGlossary();
      const items: IGlossaryItem[] = [
        { key: "1", original: "husk", translation: "dog", note: "no" },
        { key: "b", original: "test", translation: "teszt", note: "" },
        { key: "c", original: "word", translation: "szo" }
      ];

      glossary.addRange(items);

      expect(glossary.items).toContain(items[0]);
      expect(glossary.items).toContain(items[1]);
      expect(glossary.items).toContain(items[2]);
    });

    test("should skip empty words", () => {
      const glossary = createEmptyGlossary();
      const empty = { key: "c", original: "", translation: "szo" };
      const items: IGlossaryItem[] = [
        { key: "1", original: "husk", translation: "dog", note: "no" },
        { key: "b", original: "test", translation: "teszt", note: "" }
      ];
      items.push(empty);

      glossary.addRange(items);

      expect(glossary.items).not.toContain(empty);
    });

    test("should throw error on undefined parameter", () => {
      const glossary = createEmptyGlossary();

      const act = () => glossary.addRange(undefined);

      expect(act).toThrow("Invalid argument: 'newItems' is required");
    });
  });

  describe("clear", () => {
    test("should remove all previously added items", () => {
      const glossary = createGlossaryWithWords();

      glossary.clear();

      expect(glossary.items.length).toEqual(0);
    });
  });

  describe("search", () => {
    test("should return all item if search expression is empty", () => {
      const glossary = createGlossaryWithWords();
      const searchExpression = "";

      const result = glossary.search(searchExpression);

      expect(result).toEqual(glossary.items);
    });

    test("should return empty list if the search keyword not found", () => {
      const glossary = createGlossaryWithWords();
      const keyword = "there-is-no-such-word";

      const result = glossary.search(keyword);

      expect(result).toEqual([]);
    });

    test("should find words in original case insensitively without option", () => {
      const glossary = createGlossaryWithWords();
      const searchExpression = "non sensitive";
      const expectedResult = [{ key: "2", original: "nOn sEnsItIve", translation: "nEm ÉrzÉkEny" }];

      const result = glossary.search(searchExpression);

      expect(result).toEqual(expectedResult);
    });

    test("should find words in translation case insensitively without option", () => {
      const glossary = createGlossaryWithWords();
      const searchExpression = "nem érzékeny";
      const expectedResult = [{ key: "2", original: "nOn sEnsItIve", translation: "nEm ÉrzÉkEny" }];

      const result = glossary.search(searchExpression);

      expect(result).toEqual(expectedResult);
    });

    test("should find words in original case sensitively if search option set", () => {
      const glossary = createGlossaryWithWords();
      const searchExpression = "SensitivE";
      const matches = [{ key: "1", original: "SensitivE", translation: "ÉrzékenY", note: "no" }];
      const searchOptions = {
        caseSensitive: true
      };

      const result = glossary.search(searchExpression, searchOptions);

      expect(result).toEqual(matches);
    });

    test("should find words in translation case sensitively if search option set", () => {
      const glossary = createGlossaryWithWords();
      const searchExpression = "ÉrzékenY";
      const expectedResult = [{ key: "1", original: "SensitivE", translation: "ÉrzékenY", note: "no" }];
      const searchOptions = {
        caseSensitive: true
      };

      const result = glossary.search(searchExpression, searchOptions);

      expect(result).toEqual(expectedResult);
    });

    test("should find only whole words in original case insensitively when options set", () => {
      const glossary = createGlossaryWithWords();
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
      const glossary = createGlossaryWithWords();
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
      const glossary = createGlossaryWithWords();
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
      const glossary = createGlossaryWithWords();
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
