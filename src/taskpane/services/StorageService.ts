import { IGlossaryItem } from "../components/Glossary";

const XMLNS = "http://burrito.org/translate";
const ID_SETTINGS_KEY = "BurritoMemory";

export default class StorageService {
  public static saveGlossary(data: IGlossaryItem[]): Promise<string> {
    const doc = Office.context.document;
    const xmlString = this.convertToXml(data);

    return new Promise<string>((resolve, _) => {
      this.clear().then(() => {
        doc.customXmlParts.addAsync(xmlString, xmlPart => {
          doc.settings.set(ID_SETTINGS_KEY, xmlPart.value.id);
          doc.settings.saveAsync(() => {
            resolve("Success");
          });
        });
      });
    });
  }

  public static loadGlossary(): Promise<IGlossaryItem[]> {
    const glossary = [];
    return new Promise<IGlossaryItem[]>((resolve, _) => {
      const id = Office.context.document.settings.get(ID_SETTINGS_KEY);
      if (!id) {
        resolve([]);
      }

      this.getByIdAsync(id).then(asyncResult => {
        if (!asyncResult.value) {
          resolve([]);
        }
        this.getXmlAsync(asyncResult.value).then(xml => {
          const xmlDoc = this.parseXML(xml);
          const items = xmlDoc.getElementsByTagName("item");
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            glossary.push({
              key: i.toString(),
              hu: item.getAttribute("hu"),
              en: item.getAttribute("en"),
              note: item.getAttribute("note")
            });
          }
          resolve(glossary);
        });
      });
    });
  }

  private static clear(): Promise<void> {
    return new Promise<void>((resolve, __) => {
      const id = Office.context.document.settings.get(ID_SETTINGS_KEY);
      if (!!id) {
        Office.context.document.customXmlParts.getByIdAsync(id, prevPart => {
          if (!prevPart.error) {
            prevPart.value.deleteAsync(() => {
              resolve();
            });
          } else {
            Office.context.document.settings.remove(ID_SETTINGS_KEY);
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  private static convertToXml(data: IGlossaryItem[]): string {
    const len = data.length;
    let xmlString = `<burritoMemory count='${len}' xmlns='${XMLNS}'>`;
    data.forEach((item: IGlossaryItem) => {
      const noteAttr = !!item.note ? `note='${item.note}' ` : "";
      xmlString += `<item hu='${item.hu}' en='${item.en}' ${noteAttr}/>`;
    });
    xmlString += "</burritoMemory>";
    return xmlString;
  }

  private static parseXML(xmlString): Document {
    const parser = new DOMParser();
    // Parse a simple Invalid XML source to get namespace of <parsererror>:
    const docError = parser.parseFromString("INVALID", "text/xml");
    const parseErrorNS = docError.getElementsByTagName("parsererror")[0].namespaceURI;
    // Parse xmlString:
    // (XMLDocument object)
    const doc = parser.parseFromString(xmlString, "text/xml");
    if (doc.getElementsByTagNameNS(parseErrorNS, "parsererror").length > 0) {
      throw new Error("Error parsing XML");
    }
    return doc;
  }

  public static getByIdAsync(id: string): Promise<Office.AsyncResult<Office.CustomXmlPart>> {
    return new Promise<Office.AsyncResult<Office.CustomXmlPart>>((resolve, _) => {
      Office.context.document.customXmlParts.getByIdAsync(id, (result: Office.AsyncResult<Office.CustomXmlPart>) => {
        return resolve(result);
      });
    });
  }

  public static getXmlAsync(xmlPart: Office.CustomXmlPart): Promise<string> {
    return new Promise<string>((resolve, _) => {
      xmlPart.getXmlAsync((result: Office.AsyncResult<any>) => {
        return resolve(result.value);
      });
    });
  }
}
