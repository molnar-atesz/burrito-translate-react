import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import {
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    IColumn,
    SelectionMode,
    DetailsRow,
    IDetailsFooterProps,
    IDetailsRowBaseProps,
    DetailsRowCheck,
    IDetailsRowCheckStyles,
    CheckboxVisibility,
  } from 'office-ui-fabric-react/lib/DetailsList';
import React = require("react");
import { IStackTokens, Stack } from 'office-ui-fabric-react/lib/Stack';

export interface ITranslationMemoryItem {
    key: string,
    hu: string;
    en: string;
    note?: string;
}

export interface ITranslationMemoryProps {
    items: ITranslationMemoryItem[];
}

export interface ITranslationMemoryState {
    items: ITranslationMemoryItem[];
    columns: IColumn[];
}

const stackTokens: IStackTokens = {
    childrenGap: 5,
};

export default class TranslationMemory extends React.Component<ITranslationMemoryProps, ITranslationMemoryState>{
    private _selection: Selection;
    private _allItems: ITranslationMemoryItem[];

    constructor(props) {
        super(props);

        const columns: IColumn[] = [
            {
                key: 'enCol',
                name: 'Angol',
                fieldName: 'en',
                minWidth: 50,
                maxWidth: 90,
                isRowHeader: true,
                isResizable: true,
                isSorted: true,
                isSortedDescending: false,
                sortAscendingAriaLabel: 'Sorted A to Z',
                sortDescendingAriaLabel: 'Sorted Z to A',
                onColumnClick: this._onColumnClick,
                data: 'string',
                isPadded: true,
            },
            {
              key: 'huCol',
              name: 'Magyar',
              fieldName: 'hu',
              minWidth: 50,
              maxWidth: 90,
              isRowHeader: true,
              isResizable: true,
              isSorted: true,
              isSortedDescending: false,
              sortAscendingAriaLabel: 'Sorted A to Z',
              sortDescendingAriaLabel: 'Sorted Z to A',
              onColumnClick: this._onColumnClick,
              data: 'string',
              isPadded: true,
            },
            {
              key: 'noteCol',
              name: 'Megjegyzés',
              fieldName: 'note',
              minWidth: 50,
              maxWidth: 90,
              isMultiline: true,
              isRowHeader: true,
              isResizable: true,
              isSorted: true,
              isSortedDescending: false,
              sortAscendingAriaLabel: 'Sorted A to Z',
              sortDescendingAriaLabel: 'Sorted Z to A',
              onColumnClick: this._onColumnClick,
              data: 'string',
              isPadded: true,
            }
        ];

        this._selection = new Selection({
            onSelectionChanged: async () => {
                await this._insertWord(this._getSelectionDetails());
            }
        });

        this.state = {
            items: [],
            columns: columns
        };
    }

    componentDidUpdate(prevProps: ITranslationMemoryProps) {
        if(prevProps.items !== this.props.items) {
            this._allItems = this.props.items;
            this.setState({
                items: this._allItems
            });
        }
    }

    componentDidMount() {
        this._allItems = this.props.items;
        this.setState({
            items: this._allItems
        });
    }

    public render() {
        const { items, columns } = this.state;

        return (
            <main className="ms-welcome__main">
                <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">Fordítási memória</h2>
                <Stack tokens={stackTokens}>
                    <Stack.Item align="stretch">
                        <SearchBox placeholder="Keresés" onChange={this._onChangeText } />
                    </Stack.Item>
                    <Stack.Item align="stretch">
                        <DetailsList
                            items={items}
                            columns={columns}
                            getKey={this._getKey}
                            setKey="none"
                            selection={this._selection}
                            selectionMode={SelectionMode.single}
                            layoutMode={DetailsListLayoutMode.justified}
                            selectionPreservedOnEmptyClick={true}
                            isHeaderVisible={true}
                            onRenderDetailsFooter={this._onRenderDetailsFooter}
                            checkboxVisibility={CheckboxVisibility.hidden}
                        />
                    </Stack.Item>
                </Stack>
            </main>
        );
    }

    private async _insertWord(item: ITranslationMemoryItem) {
        await Word.run(async (context) => {
            let body = context.document.body;
            body.insertParagraph(item.hu, Word.InsertLocation.end);
            await context.sync();
        });
    }

    private _getKey(item: any, _?: number): string {
        return item.key;
    }

    private _getSelectionDetails(): ITranslationMemoryItem {
        const selectionCount = this._selection.getSelectedCount();

        switch (selectionCount) {
            case 0:
                return null;
            case 1:
                return this._selection.getSelection()[0] as ITranslationMemoryItem;
            default:
                return this._selection.getSelection()[0] as ITranslationMemoryItem;
        }
    }

    private _onChangeText = (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
        this.setState({
            items: text ? this._allItems.filter(i => i.en.toLowerCase().indexOf(text.toLowerCase()) > -1) : this._allItems,
        });
    };

    private _onColumnClick = (_: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const { columns, items } = this.state;
        const newColumns: IColumn[] = columns.slice();
        const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol: IColumn) => {
          if (newCol === currColumn) {
            currColumn.isSortedDescending = !currColumn.isSortedDescending;
            currColumn.isSorted = true;
          } else {
            newCol.isSorted = false;
            newCol.isSortedDescending = true;
          }
        });
        const newItems = _copyAndSort(items, currColumn.fieldName!, currColumn.isSortedDescending);
        this.setState({
          columns: newColumns,
          items: newItems,
        });
    }

    private _onRenderDetailsFooter(detailsFooterProps: IDetailsFooterProps): JSX.Element {
        return (
          <DetailsRow
            {...detailsFooterProps}
            columns={detailsFooterProps.columns}
            item={{}}
            itemIndex={-1}
            groupNestingDepth={detailsFooterProps.groupNestingDepth}
            selectionMode={SelectionMode.single}
            selection={detailsFooterProps.selection}
            onRenderItemColumn={_renderDetailsFooterItemColumn}
            onRenderCheck={_onRenderCheckForFooterRow}
          />
        );
      }
}

const _renderDetailsFooterItemColumn: IDetailsRowBaseProps['onRenderItemColumn'] = (_, __, column) => {
    if (column) {
        return (
        <div>
            <b>{column.name}</b>
        </div>
        );
    }
    return undefined;
};

const detailsRowCheckStyles: Partial<IDetailsRowCheckStyles> = { root: { visibility: 'hidden' } };

const _onRenderCheckForFooterRow: IDetailsRowBaseProps['onRenderCheck'] = (props): JSX.Element => {
    return <DetailsRowCheck {...props} styles={detailsRowCheckStyles} selected={true} />;
};

function _copyAndSort<ITranslationMemoryItem>(items: ITranslationMemoryItem[], columnKey: string, isSortedDescending?: boolean): ITranslationMemoryItem[] {
    const key = columnKey as keyof ITranslationMemoryItem;
    return items.slice(0).sort((a: ITranslationMemoryItem, b: ITranslationMemoryItem) => ((isSortedDescending ? a[key] < b[key]: a[key] > b[key]) ? 1 : -1));
}