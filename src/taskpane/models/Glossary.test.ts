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

    test("should throw error on duplicated word", () => {
      let item: IGlossaryItem = { key: "a", original: "husk", translation: "dog", note: "no" };
      glossary.addItem(item);
      item.translation = "new translation";

      expect(() => glossary.addItem(item)).toThrow("Already contains word 'husk'.");
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
});
