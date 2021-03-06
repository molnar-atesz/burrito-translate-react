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
import { TooltipHost, ITooltipHostStyles } from "office-ui-fabric-react/lib/Tooltip"
import { MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { getTheme } from 'office-ui-fabric-react/lib/Styling';

import { IGlossary, IGlossaryItem } from '../types/glossary';
import { Language } from '../models/Glossary';
import { copyAndSortItems } from '../utils/helpers';

export interface IGlossaryTableProps {
    glossary: IGlossary;
    notify: (message: string, messageType?: MessageBarType) => any
}

export interface IGlossaryTableState {
    items: IGlossaryItem[];
    columns: IColumn[];
}

const stackTokens: IStackTokens = {
    childrenGap: 5,
};

const theme = getTheme()

export default class GlossaryTable extends React.Component<IGlossaryTableProps, IGlossaryTableState>{
    private _selection: Selection;
    private _allItems: IGlossaryItem[];

    constructor(props) {
        super(props);

        const columns: IColumn[] = [
            this._getLanguageColumn(this.props.glossary.source, true),
            this._getLanguageColumn(this.props.glossary.target),
            {
                key: 'noteCol',
                name: 'Note',
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
                const selectionDetails = this._selection.getSelection()[0] as IGlossaryItem;
                await this._insertWord(selectionDetails);
                this._selection.toggleAllSelected();
            },
            selectionMode: SelectionMode.single
        });

        this.state = {
            items: [],
            columns: columns
        };
    }

    componentDidUpdate(prevProps: IGlossaryTableProps) {
        if(prevProps.glossary !== this.props.glossary) {
            this._allItems = this.props.glossary.items;
            this.setState({
                items: [...this._allItems]
            });
        }
    }

    componentDidMount() {
        this._allItems = this.props.glossary.items;
        this.setState({
            items: [...this._allItems]
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
                        <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">Glossary</h2>
                    </Stack.Item>
                    <Stack.Item align="stretch">
                        <SearchBox placeholder="Search" onChange={this._onSearchTextChanged} />
                    </Stack.Item>
                    <Stack.Item align="stretch">
                        <DetailsList
                            items={items}
                            columns={columns}
                            getKey={this._getKey}
                            compact={true}
                            setKey="none"
                            selection={this._selection}
                            layoutMode={DetailsListLayoutMode.justified}
                            checkboxVisibility={CheckboxVisibility.hidden}
                            selectionPreservedOnEmptyClick={false}
                            isHeaderVisible={true}
                            onRenderRow={this._onRenderRow}
                            onRenderItemColumn={this._renderItemColumn}
                        />
                    </Stack.Item>
                </Stack>
        );
    }
    
    private _getLanguageColumn(lang: Language, isSource: boolean = false): IColumn {
        const headerPrefix = isSource ? 'From' : 'To';
        const columnHeader = `${headerPrefix} (${lang.name})`;
        const fieldName = isSource ? 'original' : 'translation';

        return {
            key: `${headerPrefix}Col`,
            name: columnHeader,
            fieldName: fieldName,
            minWidth: 50,
            maxWidth: 80,
            isMultiline: true,
            isResizable: true,
            sortAscendingAriaLabel: 'Sort A..Z',
            sortDescendingAriaLabel: 'Sort Z..A',
            onColumnClick: this._onOrderByColumn,
            data: 'string',
            isPadded: true
        };
    }

    private async _insertWord(item: IGlossaryItem) {
        await Word.run(async (context) => {
            Office.context.document.setSelectedDataAsync(item.translation, asyncResult => {
                if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                    this.props.notify("Insertion failed", MessageBarType.error);
                }
            });
            await context.sync();
        });
    }

    private _getKey(item: any, _?: number): string {
        return item.key;
    }
    
    private _onSearchTextChanged = (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
        this.setState({
            items: text ? this._allItems.filter(item => item.original.toLowerCase().indexOf(text.toLowerCase()) > -1) : this._allItems,
        });
    };

    private _onOrderByColumn = (_: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const { columns, items } = this.state;
        const newColumns: IColumn[] = columns.slice();
        const clickedColumn: IColumn = newColumns.filter(col => column.key === col.key)[0];
        newColumns.forEach((column: IColumn) => {
          if (column === clickedColumn) {
            clickedColumn.isSortedDescending = !clickedColumn.isSortedDescending;
            clickedColumn.isSorted = true;
          } else {
            column.isSorted = false;
            column.isSortedDescending = true;
          }
        });
        const newItems = copyAndSortItems(items, clickedColumn.fieldName!, clickedColumn.isSortedDescending);
        this.setState({
          columns: newColumns,
          items: newItems,
        });
    }

    private _onRenderRow: IDetailsListProps['onRenderRow'] = props => {
        const customStyles: Partial<IDetailsRowStyles> = {};
        if (props) {
            customStyles.cell = { fontSize: '12px' };
            if (props.itemIndex % 2 === 0) {
                // Every other row renders with a different background color
                customStyles.root = { backgroundColor: theme.palette.themeLighterAlt };
            }

            return <DetailsRow {...props} styles={customStyles} />;
        }
        return null;
    };

    private _renderItemColumn = (item: IGlossaryItem, index: number, column: IColumn) => {
        const fieldContent = item[column.fieldName as keyof IGlossaryItem] as string;
        const commentIcon: IIconProps = { iconName: 'Comment' };
        const tooltipId = `note${index}`
        const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block' } };

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