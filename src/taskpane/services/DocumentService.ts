export default class DocumentService {
  constructor() {}

  public async insertText(text: string): Promise<boolean> {
    await Word.run(async context => {
      const doc = context.document;
      const selectedRange = doc.getSelection();
      selectedRange.insertText(text, Word.InsertLocation.replace);

      await context.sync();
      return true;
    }).catch(error => {
      console.log(error);
      if (error instanceof OfficeExtension.Error) {
        console.log("Debug info: " + JSON.stringify(error.debugInfo));
      }
      return false;
    });
    return false;
  }
}
