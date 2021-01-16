import React = require("react");

export interface ITranslationMemoryItem {
    hu: string;
    en: string;
    note?: string;
}

export interface ITranslationMemoryProps {
    items: ITranslationMemoryItem[];
}

export default class TranslationMemory extends React.Component<ITranslationMemoryProps>{
    insertWord = async (item: ITranslationMemoryItem) => {
        await Word.run(async (context) => {
            let body = context.document.body;
            body.insertParagraph(item.hu, Word.InsertLocation.end);
            await context.sync();
          });
    }

    public render() {
        const { items } = this.props;

        const memoryItems = items.map((item, _) =>(
            <tr key={item.en} onClick={() => { this.insertWord(item) } }>
                <td>
                    {item.en}
                </td>
                <td>
                    {item.hu}
                </td>
                <td>
                    {item.note}
                </td>
            </tr>
        ));

        return (
            <main className="ms-welcome__main">
                <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">Fordítási memória</h2>
                <table>
                    <thead>
                        <th>Angol</th>
                        <th>Magyar</th>
                        <th>Megjegyzés</th>
                    </thead>
                    <tbody>
                        {memoryItems}
                    </tbody>
                </table>
            </main>
        );
    }
}