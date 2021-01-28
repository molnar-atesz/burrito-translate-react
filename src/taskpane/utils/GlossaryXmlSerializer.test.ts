import { Glossary } from "../models/Glossary";
import { LANGUAGES, XMLNS } from "./constants";
import GlossaryXmlSerializer from "./GlossaryXmlSerializer";

test("Serialize", () => {
  let serializer = new GlossaryXmlSerializer(XMLNS);
  let glossary = new Glossary(
    LANGUAGES.find(l => l.abbreviation === "en"),
    LANGUAGES.find(l => l.abbreviation === "hu")
  );

  const res = serializer.serialize(glossary);
  expect(res).toContain("burritoMemory");
});
