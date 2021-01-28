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

    test("should initialize items", () => {
      expect(glossary.items).toBeDefined();
    });
  });

  describe("addItem", () => {
    let glossary: IGlossary;
    const russian = new Language("Russian", "ru", 1);
    const hungarian = new Language("Magyar", "hu", 2);

    beforeEach(() => {
      glossary = new Glossary(russian, hungarian);
    });

    test("should has no items after creation", () => {
      expect(glossary.items.length).toBe(0);
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
});
