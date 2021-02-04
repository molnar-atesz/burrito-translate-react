import { Glossary, Language } from "../models/Glossary";
import { IGlossary, IGlossaryItem, IGlossaryXmlSerializer } from "../types/glossary";
import { LANGUAGES, XMLNS } from "./constants";
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
    glossary.items.push(item1, item2);

    const res = serializer.serialize(glossary);

    expect(res).toContain(
      "<items><item original='the' translation='az' note='megj' /><item original='one' translation='egy' /></items>"
    );
  });
});
