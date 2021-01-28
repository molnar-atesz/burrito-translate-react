import { IGlossary, IGlossaryItem, IGlossaryXmlSerializer } from "../types/glossary";

export default class GlossaryXmlSerializer implements IGlossaryXmlSerializer {
  private readonly XMLNS: string;

  constructor(xmlns: string) {
    this.XMLNS = xmlns;
  }

  serialize(glossary: IGlossary): string {
    let xmlString = `<burritoMemory xmlns='${this.XMLNS}'>`;
    xmlString += `<source>${glossary.source}</source>`;
    xmlString += `<target>${glossary.target}</target>`;
    xmlString += `<created>${glossary.created.toJSON()}</created>`;
    xmlString += this.serializeItems(xmlString, glossary);
    xmlString += "</burritoMemory>";
    return xmlString;
  }

  deserialize(xml: string): IGlossary {
    const xmlDoc = this.parseXML(xml);
    console.log(xmlDoc);

    return null;
  }

  private serializeItems(xmlString: string, glossary: IGlossary) {
    xmlString += `<items>`;
    glossary.items.forEach((item: IGlossaryItem) => {
      const noteAttr = !!item.note ? `note='${item.note}' ` : "";
      xmlString += `<item original='${item.original}' translation='${item.translation}' ${noteAttr}/>`;
    });
    xmlString += `</items>`;
    return xmlString;
  }

  private parseXML(xml: string): Document {
    const parser = new DOMParser();
    // Parse a simple Invalid XML source to get namespace of <parsererror>:
    const docError = parser.parseFromString("INVALID", "text/xml");
    const parseErrorNS = docError.getElementsByTagName("parsererror")[0].namespaceURI;
    // Parse xmlString:
    // (XMLDocument object)
    const doc = parser.parseFromString(xml, "text/xml");
    if (doc.getElementsByTagNameNS(parseErrorNS, "parsererror").length > 0) {
      throw new Error("Error parsing XML");
    }
    return doc;
  }
}
