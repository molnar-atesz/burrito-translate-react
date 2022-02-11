/**
 * @jest-environment node
 */

import { OfficeApp } from "office-addin-manifest";
import { OfficeMockObject } from "office-addin-mock";
import DocumentService from "./DocumentService";

const mockData = {
  context: {
    document: {
      range: {
        text: "asd",
        insertText: function(text: string, insertlocation: Word.InsertLocation) {
          this.text = text;
          this.insertlocation = insertlocation;
          return this;
        }
      },
      getSelection: function() {
        return this.range;
      }
    }
  },
  // Mock the Word.InsertLocation enum.
  InsertLocation: {
    replace: "Replace"
  },
  // Mock the Word.run method.
  run: async function(callback) {
    await callback(this.context);
  }
};
const officeMock = new OfficeMockObject(mockData, OfficeApp.Word);
// @ts-ignore
global.Office = officeMock;
// @ts-ignore
global.Word = officeMock;

describe("DocumentService", () => {
  describe("insertText", () => {
    test("should replace selected text in the document", async () => {
      const doccumentService = new DocumentService();
      await doccumentService.insertText("translation");
      expect(officeMock.context.document.range.text).toBe("translation");
    });
  });
});
