import { Glossary } from "../models/Glossary";
import { IGlossary, IGlossaryItem, IGlossaryXmlSerializer } from "../types/glossary";
import { LANGUAGES } from "./constants";

export default class GlossaryXmlSerializer implements IGlossaryXmlSerializer {
  private readonly XMLNS: string;

  constructor(xmlns: string) {
    if (!xmlns) {
      throw new Error("Invalid argument: xmlns is required");
    }
    this.XMLNS = xmlns;
  }

  public serialize(glossary: IGlossary): string {
    let xmlString = `<burritoMemory xmlns='${this.XMLNS}'>
      <source>${glossary.source.abbreviation}</source>
      <target>${glossary.target.abbreviation}</target>
      <created>${glossary.created.toJSON()}</created>
      ${this.serializeItems(glossary)}
    </burritoMemory>`;
    return xmlString;
  }

  public deserialize(xml: string): IGlossary {
    const xmlDoc = this.parseXML(xml);
    const { source, target, created } = this.deserializeBasicProps(xmlDoc);

    let glossary = new Glossary(source, target, created);
    this.deserializeItems(glossary, xmlDoc);

    return glossary;
  }

  private deserializeBasicProps(xmlDoc: Document): { source: any; target: any; created: any } {
    const sourceElem = xmlDoc.getElementsByTagName("source")[0];
    const targetElem = xmlDoc.getElementsByTagName("target")[0];
    const createdElem = xmlDoc.getElementsByTagName("created")[0];

    const sourceLang = LANGUAGES.find(l => l.abbreviation == sourceElem.innerHTML);
    const targetLang = LANGUAGES.find(l => l.abbreviation == targetElem.innerHTML);
    const created = new Date(createdElem.innerHTML);

    return { source: sourceLang, target: targetLang, created: created };
  }

  private deserializeItems(glossary: IGlossary, xmlDoc: Document): void {
    const itemsElements = xmlDoc.getElementsByTagName("item");
    for (let i = 0; i < itemsElements.length; i++) {
      const itemNode = itemsElements[i];
      const note = itemNode.hasAttribute("note") ? itemNode.getAttribute("note") : undefined;

      const newItem: IGlossaryItem = {
        key: (i + 1).toString(),
        original: itemNode.getAttribute("original"),
        translation: itemNode.getAttribute("translation"),
        note: note
      };
      glossary.addItem(newItem);
    }
  }

  private serializeItems(glossary: IGlossary) {
    let itemsNode = `<items>`;
    glossary.items.forEach((item: IGlossaryItem) => {
      const noteAttr = !!item.note ? `note='${item.note}' ` : "";
      itemsNode += `<item original='${item.original}' translation='${item.translation}' ${noteAttr}/>`;
    });
    itemsNode += `</items>`;
    return itemsNode;
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
