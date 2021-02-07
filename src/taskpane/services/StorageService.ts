import { IGlossary, IGlossaryStore, IGlossaryXmlSerializer } from "../types/glossary";
import { ID_SETTINGS_KEY } from "../utils/constants";

// TODO: wrap Office into a mockable class - Proxy?
export default class StorageService implements IGlossaryStore {
  private serializer: IGlossaryXmlSerializer;

  constructor(xmlSerializer: IGlossaryXmlSerializer) {
    this.serializer = xmlSerializer;
  }

  public saveAsync(glossary: IGlossary): Promise<string> {
    const glossaryXML = this.serializer.serialize(glossary);
    const doc = Office.context.document;

    return new Promise<string>((resolve, _) => {
      this.clearAsync().then(() => {
        doc.customXmlParts.addAsync(glossaryXML, xmlPart => {
          doc.settings.set(ID_SETTINGS_KEY, xmlPart.value.id);
          doc.settings.saveAsync(() => {
            resolve("Success");
          });
        });
      });
    });
  }

  public loadAsync(): Promise<IGlossary> {
    return new Promise<IGlossary>((resolve, reject) => {
      const id = Office.context.document.settings.get(ID_SETTINGS_KEY);
      if (!id) {
        reject("No saved glossary found");
      }

      this.getByIdAsync(id).then(asyncResult => {
        if (!asyncResult.value) {
          reject("Previously saved glossary not found");
        }
        this.getXmlAsync(asyncResult.value).then(xml => {
          const glossary = this.serializer.deserialize(xml);
          resolve(glossary);
        });
      });
    });
  }

  public clearAsync(): Promise<void> {
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

  private getByIdAsync(id: string): Promise<Office.AsyncResult<Office.CustomXmlPart>> {
    return new Promise<Office.AsyncResult<Office.CustomXmlPart>>((resolve, _) => {
      Office.context.document.customXmlParts.getByIdAsync(id, (result: Office.AsyncResult<Office.CustomXmlPart>) => {
        return resolve(result);
      });
    });
  }

  private getXmlAsync(xmlPart: Office.CustomXmlPart): Promise<string> {
    return new Promise<string>((resolve, _) => {
      xmlPart.getXmlAsync((result: Office.AsyncResult<any>) => {
        return resolve(result.value);
      });
    });
  }
}
