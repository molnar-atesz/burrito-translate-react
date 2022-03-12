import * as React from "react";
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
  IDetailsHeaderProps
} from "office-ui-fabric-react/lib/DetailsList";
import {
  DirectionalHint,
  HoverCard,
  HoverCardType,
  IPlainCardProps,
  IRenderFunction,
  Sticky,
  StickyPositionType,
  Text
} from "office-ui-fabric-react";

import { Stack } from "office-ui-fabric-react/lib/Stack";
import { MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
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
  onDeleteRow(item: IGlossaryItem): void;
  notify(message: string, messageType?: MessageBarType): any;
}

export interface IGlossaryTableState {
  items: IGlossaryItem[];
  columns: IColumn[];
}

const theme = getTheme();

export default class GlossaryTable extends React.Component<IGlossaryTableProps, IGlossaryTableState> {
  private _selection: Selection;
  private _allItems: IGlossaryItem[];

  constructor(props) {
    super(props);
    this._selection = new Selection({
      onSelectionChanged: this._onSelectedItemChanged
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
      this._selection.setAllSelected(false);
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

    return (
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
        onRenderItemColumn={this._onRenderItemColumn}
        onRenderDetailsHeader={this._onRenderDetailsHeader}
        selectionMode={SelectionMode.single}
      />
    );
  }

  private _onSelectedItemChanged = async () => {
    if (this._selection.getSelectedCount() === 1) {
      const selectionDetails = this._selection.getSelection()[0] as IGlossaryItem;
      await this.props.onRowClick(selectionDetails);
      setTimeout(() => {
        // if it called without timeout it fires insertion again
        this._selection.setAllSelected(false);
      }, 500);
    }
  }

  private _getColumns(): IColumn[] {
    return [
      this._getLanguageColumn(this.props.source, true),
      this._getLanguageColumn(this.props.target),
      {
        key: "commandCol",
        name: "",
        fieldName: "command",
        minWidth: 70,
        maxWidth: 70,
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

  private _onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
    if (!props) {
      return null;
    }
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced>
        {defaultRender!({
          ...props,
        })}
      </Sticky>
    );
  }

  private _onRenderRow: IDetailsListProps["onRenderRow"] = props => {
    const alternatingColors: Partial<IDetailsRowStyles> = {
      cell: {
        verticalAlign: "middle"
      }
    };
    if (props) {
      if (props.itemIndex % 2 === 0) {
        alternatingColors.root = { backgroundColor: theme.palette.themeLighterAlt };
      }

      return <DetailsRow {...props} styles={alternatingColors} />;
    }
    return null;
  };

  private _onRenderItemColumn = (item: IGlossaryItem, _: number, column: IColumn) => {
    const fieldContent = item[column.fieldName as keyof IGlossaryItem] as string;

    if (column.fieldName === "command") {
      return this._getCommandField(item);
    } else {
      return this._getItemField(item, fieldContent, column.fieldName);
    }
  };

  private _getCommandField(item: IGlossaryItem) {
    return <Stack horizontal horizontalAlign="space-between" data-selection-disabled={true}>
      <IconButton
        iconProps={{ iconName: "Edit" }}
        data-selection-disabled={true}
        onClick={_ => {
          this.props.onEditRow(item);
        }} />
      <IconButton
        iconProps={{ iconName: "Delete" }}
        data-selection-disabled={true}
        onClick={_ => {
          this.props.onDeleteRow(item);
        }} />
    </Stack>;
  }

  private _getItemField(item: IGlossaryItem, fieldContent: string, fieldName: string): JSX.Element {
    if (!!item.note && fieldName === "original") {
      return this._getItemFieldWithNote(item, fieldContent);
    } else {
      return (
        <div>{fieldContent}</div>
      );
    }
  }

  private _getItemFieldWithNote(item: IGlossaryItem, fieldContent: string) {
    const noteCardProps: IPlainCardProps = {
      renderData: item.note,
      onRenderPlainCard: this._onRenderPlainCard,
      directionalHint: DirectionalHint.topRightEdge
    };
    return (<HoverCard
      cardDismissDelay={1000}
      cardOpenDelay={1000}
      type={HoverCardType.plain}
      plainCardProps={noteCardProps}
      className="noteAvailable"
    >
      <div>
        <Text block>{fieldContent}</Text>
      </div>
    </HoverCard>);
  }

  private _onRenderPlainCard = (note: string): JSX.Element => {
    return (
      <div style={{ padding: "10px", backgroundColor: theme.palette.themeDarkAlt, color: theme.palette.themeLight }}>
        {note}
      </div>
    );
  }
}
