import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import {
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    IColumn,
    SelectionMode,
    DetailsRow,
    CheckboxVisibility,
    IDetailsListProps,
    IDetailsRowStyles,
    ColumnActionsMode,
  } from 'office-ui-fabric-react/lib/DetailsList';
import React = require("react");
import { IStackProps, IStackTokens, Stack } from 'office-ui-fabric-react/lib/Stack';
import { getTheme } from 'office-ui-fabric-react/lib/Styling';
import { IconButton, IIconProps, ITooltipHostStyles, merge, TooltipHost } from 'office-ui-fabric-react';

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

const theme = getTheme()

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
                isMultiline: true,
                isResizable: true,
                sortAscendingAriaLabel: 'Rendezés A..Z',
                sortDescendingAriaLabel: 'Rendezés Z..A',
                onColumnClick: this._onColumnClick,
                data: 'string',
                isPadded: true
            },
            {
                key: 'huCol',
                name: 'Magyar',
                fieldName: 'hu',
                minWidth: 50,
                maxWidth: 90,
                isMultiline: true,
                isResizable: true,
                sortAscendingAriaLabel: 'Rendezés A..Z',
                sortDescendingAriaLabel: 'Rendezés Z..A',
                onColumnClick: this._onColumnClick,
                data: 'string',
                isPadded: true
            },
            {
                key: 'noteCol',
                name: 'Jegyzet',
                fieldName: 'note',
                minWidth: 50,
                maxWidth: 50,
                columnActionsMode: ColumnActionsMode.disabled,
                isRowHeader: false,
                isResizable: false,
                data: 'string',
                isCollapsible: true,
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
        const stackProps: IStackProps = {
            root: {
                style: {
                    padding: '10px'
                }
            }
        };

        return (
                <Stack tokens={stackTokens} {...stackProps}>
                    <Stack.Item align="center">
                        <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">Fordítási memória</h2>
                    </Stack.Item>
                    <Stack.Item align="stretch">
                        <SearchBox placeholder="Keresés (angol)" onChange={this._onChangeText} />
                    </Stack.Item>
                    <Stack.Item align="stretch">
                        <DetailsList
                            items={items}
                            columns={columns}
                            getKey={this._getKey}
                            compact={true}
                            setKey="none"
                            selection={this._selection}
                            selectionMode={SelectionMode.single}
                            layoutMode={DetailsListLayoutMode.justified}
                            checkboxVisibility={CheckboxVisibility.hidden}
                            selectionPreservedOnEmptyClick={true}
                            isHeaderVisible={true}
                            onRenderRow={this._onRenderRow}
                            onRenderItemColumn={this._renderItemColumn}
                        />
                    </Stack.Item>
                </Stack>
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

    private _onRenderRow: IDetailsListProps['onRenderRow'] = props => {
        const customStyles: Partial<IDetailsRowStyles> = {};
        if (props) {
            customStyles.root = { fontSize: '12px' };
            if (props.itemIndex % 2 === 0) {
                // Every other row renders with a different background color
                customStyles.root = merge(customStyles.root, { backgroundColor: theme.palette.themeLighterAlt });
            }

            return <DetailsRow {...props} styles={customStyles} />;
        }
        return null;
    };

    private _renderItemColumn = (item: ITranslationMemoryItem, index: number, column: IColumn) => {
        const fieldContent = item[column.fieldName as keyof ITranslationMemoryItem] as string;
        const commentIcon: IIconProps = { iconName: 'Comment' };
        const tooltipId = `note${index}`
        const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block', alignContent: 'center' } };

        if(column.fieldName === 'note' && !!fieldContent) {
            return (
                <TooltipHost content={fieldContent} id={tooltipId} styles={hostStyles}>
                    <IconButton iconProps={commentIcon} aria-describedby={tooltipId} data-selection-disabled={true} />
                </TooltipHost>
            );
        } else {
            return (<span>{fieldContent}</span>);
        }
    }
}

function _copyAndSort<ITranslationMemoryItem>(items: ITranslationMemoryItem[], columnKey: string, isSortedDescending?: boolean): ITranslationMemoryItem[] {
    const key = columnKey as keyof ITranslationMemoryItem;
    return items.slice(0)
                .sort((aItem: ITranslationMemoryItem, bItem: ITranslationMemoryItem) => {
                    const aLower = _getPropertyLower(aItem, key);
                    const bLower = _getPropertyLower(bItem, key);
                    const compareVal = isSortedDescending ? aLower < bLower : aLower > bLower;
                    return compareVal ? 1 : -1;
                });
}

function _getPropertyLower(item: any, key: any): string {
    let value = item[key];
    let valueLower = '';
    if(typeof value === 'string'){
        valueLower = value.toLocaleLowerCase();
    }
    return valueLower;
}