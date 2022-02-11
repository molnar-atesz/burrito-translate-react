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
  ColumnActionsMode
} from "office-ui-fabric-react/lib/DetailsList";
import * as React from "react";
import { IStackProps, IStackTokens, Stack } from "office-ui-fabric-react/lib/Stack";
import { TooltipHost, ITooltipHostStyles } from "office-ui-fabric-react/lib/Tooltip";
import { MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { IIconProps } from "office-ui-fabric-react/lib/Icon";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { getTheme } from "office-ui-fabric-react/lib/Styling";

import { IGlossaryItem } from "../types/glossary";
import { copyAndSortItems } from "../utils/helpers";

export interface IGlossaryTableProps {
  source: string;
  target: string;
  items: IGlossaryItem[];
  onRowClick(item: IGlossaryItem): Promise<any>;
  onEditRow(item: IGlossaryItem): void;
  notify(message: string, messageType?: MessageBarType): any;
}

export interface IGlossaryTableState {
  items: IGlossaryItem[];
  columns: IColumn[];
}

const stackTokens: IStackTokens = {
  childrenGap: 5
};

const theme = getTheme();

export default class GlossaryTable extends React.Component<IGlossaryTableProps, IGlossaryTableState> {
  private _selection: Selection;
  private _allItems: IGlossaryItem[];

  constructor(props) {
    super(props);

    this._selection = new Selection({
      onSelectionChanged: async () => {
        const selectionDetails = this._selection.getSelection()[0] as IGlossaryItem;
        await this.props.onRowClick(selectionDetails);
        this._selection.toggleAllSelected();
      },
      selectionMode: SelectionMode.single
    });

    this.state = {
      items: [],
      columns: this._getColumns()
    };
  }

  componentDidUpdate(prevProps: Readonly<IGlossaryTableProps>): void {
    if (prevProps.items !== this.props.items) {
      this.setState({
        items: [...this.props.items]
      });
    }
  }

  componentDidMount() {
    this._allItems = this.props.items;
    this.setState({
      items: [...this._allItems]
    });
  }

  public render() {
    const { items, columns } = this.state;
    const stackProps: IStackProps = {
      root: {
        style: {
          padding: "10px"
        }
      }
    };

    return (
      <Stack tokens={stackTokens} {...stackProps}>
        <Stack.Item align="stretch">
          <DetailsList
            items={items}
            columns={columns}
            getKey={this._getKey}
            compact={true}
            setKey="none"
            selection={this._selection}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            checkboxVisibility={CheckboxVisibility.hidden}
            selectionPreservedOnEmptyClick={false}
            isHeaderVisible={true}
            onRenderRow={this._onRenderRow}
            onRenderItemColumn={this._onRenderItemColumn}
          />
        </Stack.Item>
      </Stack>
    );
  }

  private _getColumns(): IColumn[] {
    return [
      this._getLanguageColumn(this.props.source, true),
      this._getLanguageColumn(this.props.target),
      {
        key: "noteCol",
        name: "",
        fieldName: "note",
        minWidth: 35,
        maxWidth: 35,
        columnActionsMode: ColumnActionsMode.disabled,
        isResizable: false,
        data: "string"
      },
      {
        key: "commandCol",
        name: "",
        fieldName: "command",
        minWidth: 35,
        maxWidth: 35,
        columnActionsMode: ColumnActionsMode.disabled,
        isResizable: false,
        data: "string"
      }
    ];
  }

  private _getLanguageColumn(lang: string, isSource: boolean = false): IColumn {
    const headerPrefix = isSource ? "From" : "To";
    const columnHeader = `${headerPrefix} (${lang})`;
    const fieldName = isSource ? "original" : "translation";

    return {
      key: `${headerPrefix}Col`,
      name: columnHeader,
      fieldName: fieldName,
      minWidth: 100,
      isMultiline: true,
      isResizable: true,
      isFiltered: true,
      sortAscendingAriaLabel: "Sort A..Z",
      sortDescendingAriaLabel: "Sort Z..A",
      onColumnClick: this._onOrderByColumn,
      data: "string"
    };
  }

  private _getKey(item: any, _?: number): string {
    return item.key;
  }

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
      items: newItems
    });
  };

  private _onRenderRow: IDetailsListProps["onRenderRow"] = props => {
    const customStyles: Partial<IDetailsRowStyles> = {};
    if (props) {
      customStyles.cell = { fontSize: "12px" };
      if (props.itemIndex % 2 === 0) {
        // Every other row renders with a different background color
        customStyles.root = { backgroundColor: theme.palette.themeLighterAlt };
      }

      return <DetailsRow {...props} styles={customStyles} />;
    }
    return null;
  };

  private _onRenderItemColumn = (item: IGlossaryItem, index: number, column: IColumn) => {
    const fieldContent = item[column.fieldName as keyof IGlossaryItem] as string;
    const commentIcon: IIconProps = { iconName: "Comment" };
    const tooltipId = `note${index}`;
    const hostStyles: Partial<ITooltipHostStyles> = { root: { display: "inline-block" } };

    if (column.fieldName === "note" && !!fieldContent) {
      return (
        <TooltipHost content={fieldContent} id={tooltipId} styles={hostStyles}>
          <IconButton iconProps={commentIcon} aria-describedby={tooltipId} data-selection-disabled={true} />
        </TooltipHost>
      );
    } else if (column.fieldName === "command") {
      return (
        <IconButton
          iconProps={{ iconName: "Edit" }}
          data-selection-disabled
          onClick={_ => {
            this.props.onEditRow(item);
          }}
        />
      );
    } else {
      return <span>{fieldContent}</span>;
    }
  };
}
