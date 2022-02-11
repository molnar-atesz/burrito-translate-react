import { Glossary } from "../models/Glossary";
import { Language } from "../models/Language";
import { IGlossary, IGlossaryItem, IGlossaryXmlSerializer } from "../types/glossary";
import { XMLNS } from "./constants";
import GlossaryXmlSerializer from "./GlossaryXmlSerializer";

const english = new Language("English", "en", 1);
const hungarian = new Language("Magyar", "hu", 2);

describe("constructor", () => {
  test("should throw exception on empty xmlns", () => {
    expect(() => {
      new GlossaryXmlSerializer(undefined);
    }).toThrow("Invalid argument: xmlns is required");
  });
});

describe("serialize", () => {
  let glossary: IGlossary;
  let serializer: IGlossaryXmlSerializer;
  const realDate = Date;
  const nowStubValue = "2021-02-04T22:27:58.801Z";
  const nowStubDate = new Date(nowStubValue);

  beforeAll(() => {
    // @ts-ignore
    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          super(date);
          return new realDate(date);
        }

        return nowStubDate;
      }
    };
  });

  afterAll(() => {
    global.Date = realDate;
  });

  beforeEach(() => {
    serializer = new GlossaryXmlSerializer(XMLNS);
    glossary = new Glossary(english, hungarian);
  });

  test("should create proper root node", () => {
    const res = serializer.serialize(glossary);
    const rootElementCount = (res.match(/<burritoMemory/g) || []).length;
    expect(rootElementCount).toBe(1);
  });

  test("should contain only one root node", () => {
    const res = serializer.serialize(glossary);
    expect(res.startsWith("<burritoMemory xmlns")).toBeTruthy();
  });

  test("should add xmlns value passed via constructor to root node", () => {
    const xmlnsValue = "http://xmlns.value";
    const serializer = new GlossaryXmlSerializer(xmlnsValue);

    const res = serializer.serialize(glossary);
    expect(res.startsWith(`<burritoMemory xmlns='${xmlnsValue}'>`)).toBeTruthy();
  });

  test("should add source and target language abbreviations as xml nodes", () => {
    const res = serializer.serialize(glossary);

    expect(res).toContain("<source>en</source>");
    expect(res).toContain("<target>hu</target>");
  });

  test("should add created value in json format", () => {
    const res = serializer.serialize(glossary);

    expect(res).toContain(`<created>${nowStubValue}</created>`);
  });

  test("should add all items inside a <items> node", () => {
    const item1: IGlossaryItem = { key: "1", original: "the", translation: "az", note: "megj" };
    const item2: IGlossaryItem = { key: "2", original: "one", translation: "egy" };
    glossary.addRange([item1, item2]);

    const res = serializer.serialize(glossary);

    expect(res).toContain(
      "<items><item original='the' translation='az' note='megj' /><item original='one' translation='egy' /></items>"
    );
  });

  describe("Escaping", () => {
    beforeEach(() => {
      serializer = new GlossaryXmlSerializer(XMLNS);
    });

    test("should escape '&' sign", () => {
      const item1: IGlossaryItem = { key: "1", original: "the'", translation: "az'", note: "megj'" };
      glossary.addItem(item1);

      const res = serializer.serialize(glossary);

      expect(res).toEqual(
        "<burritoMemory xmlns='http://burrito.org/translate'><source>en</source><target>hu</target><created>2021-02-04T22:27:58.801Z</created><items><item original='the&apos;' translation='az&apos;' note='megj&apos;' /></items></burritoMemory>"
      );
    });

    test("should escape '<' sign", () => {
      const item1: IGlossaryItem = { key: "1", original: "the<", translation: "az<", note: "megj<" };
      glossary.addItem(item1);

      const res = serializer.serialize(glossary);

      expect(res).toEqual(
        "<burritoMemory xmlns='http://burrito.org/translate'><source>en</source><target>hu</target><created>2021-02-04T22:27:58.801Z</created><items><item original='the&lt;' translation='az&lt;' note='megj&lt;' /></items></burritoMemory>"
      );
    });

    test("should escape '>' sign", () => {
      const item1: IGlossaryItem = { key: "1", original: "the>", translation: "az>", note: "megj>" };
      glossary.addItem(item1);

      const res = serializer.serialize(glossary);

      expect(res).toEqual(
        "<burritoMemory xmlns='http://burrito.org/translate'><source>en</source><target>hu</target><created>2021-02-04T22:27:58.801Z</created><items><item original='the&gt;' translation='az&gt;' note='megj&gt;' /></items></burritoMemory>"
      );
    });

    test("should escape '&' sign", () => {
      const item1: IGlossaryItem = { key: "1", original: "&the", translation: "&az", note: "&megj" };
      glossary.addItem(item1);

      const res = serializer.serialize(glossary);

      expect(res).toEqual(
        "<burritoMemory xmlns='http://burrito.org/translate'><source>en</source><target>hu</target><created>2021-02-04T22:27:58.801Z</created><items><item original='&amp;the' translation='&amp;az' note='&amp;megj' /></items></burritoMemory>"
      );
    });

    test("should escape '\"' sign", () => {
      const item1: IGlossaryItem = { key: "1", original: '"the"', translation: 'az"', note: 'megj"' };
      glossary.addItem(item1);

      const res = serializer.serialize(glossary);

      expect(res).toEqual(
        "<burritoMemory xmlns='http://burrito.org/translate'><source>en</source><target>hu</target><created>2021-02-04T22:27:58.801Z</created><items><item original='&quot;the&quot;' translation='az&quot;' note='megj&quot;' /></items></burritoMemory>"
      );
    });
  });

  describe("deserialize", () => {
    let serializer: IGlossaryXmlSerializer;
    const CUSTOM_XML: string =
      "<burritoMemory xmlns='http://burrito.org/translate'><source>en</source><target>hu</target><created>2021-02-03T22:27:58.801Z</created><items><item original='the' translation='az' note='megj' /><item original='one' translation='egy' /></items></burritoMemory>";

    beforeEach(() => {
      serializer = new GlossaryXmlSerializer(XMLNS);
    });

    test("should set the source and target language properly", () => {
      const res: IGlossary = serializer.deserialize(CUSTOM_XML);
      const english = new Language("English", "en", 1);
      expect(res.source).toEqual(english);
      expect(res.target).toEqual(hungarian);
      expect(res.id).toEqual("en-hu");
    });

    test("should set the created value based on XML created node", () => {
      const res: IGlossary = serializer.deserialize(CUSTOM_XML);
      const creationDate = new Date("2021-02-03T22:27:58.801Z");
      expect(res.created.toJSON()).toEqual(creationDate.toJSON());
    });

    test("should add all items from xml to the glossary", () => {
      const res = serializer.deserialize(CUSTOM_XML);
      const item1: IGlossaryItem = { key: "1", original: "the", translation: "az", note: "megj" };
      const item2: IGlossaryItem = { key: "2", original: "one", translation: "egy" };

      expect(res.items.length).toEqual(2);
      expect(res.items[0]).toEqual(item1);
      expect(res.items[1]).toEqual(item2);
    });

    test("should unescape xml default words", () => {
      const xmlToDeserialize =
        "<burritoMemory xmlns='http://burrito.org/translate'><source>en</source><target>hu</target><created>2021-02-04T22:27:58.801Z</created><items><item original='I&apos;m &lt;me&amp;myself&gt;' translation='az&quot;' note='megj&quot;' /></items></burritoMemory>";

      const res = serializer.deserialize(xmlToDeserialize);
      const item1: IGlossaryItem = { key: "1", original: "I'm <me&myself>", translation: 'az"', note: 'megj"' };

      expect(res.items.length).toEqual(1);
      expect(res.items[0]).toEqual(item1);
    });
  });
});
