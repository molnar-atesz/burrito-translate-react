export default class DocumentService {
  constructor() {}

  public async insertText(text: string): Promise<boolean> {
    await Word.run(async context => {
      Office.context.document.setSelectedDataAsync(text, (asyncResult): boolean | void => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          return false;
        }
      });
      await context.sync();
    });
    return true;
  }
}
