import { IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import { CommandBar, ICommandBarItemProps } from "office-ui-fabric-react/lib/CommandBar";
import * as React from "react";

export interface IControlPanelProps {
    onNew(e: React.MouseEvent<HTMLElement, MouseEvent>, items?: IContextualMenuItem): boolean;

    onSave(e: React.MouseEvent<HTMLElement, MouseEvent>, items?: IContextualMenuItem): boolean;

    onImport(e: React.MouseEvent<HTMLElement, MouseEvent>, items?: IContextualMenuItem): boolean;

    importDisabled?: boolean;

    onExport(e: React.MouseEvent<HTMLElement, MouseEvent>, items?: IContextualMenuItem): boolean;
}

export default class ControlPanel extends React.Component<IControlPanelProps> {
    private _menuItems: ICommandBarItemProps[];

    constructor(props) {
        super(props);
        this._menuItems = [
            {
                key: "newWord",
                text: "New word",
                cacheKey: 'newWordCache',
                iconProps: { iconName: 'Add' },
                onClick: this.props.onNew
            },
            {
                key: "saveGlossary",
                text: "Save",
                cacheKey: 'saveGlossaryCache',
                iconProps: { iconName: 'Save' },
                onClick: this.props.onSave
            },
            {
                key: "importGlossary",
                text: "Import CSV",
                cacheKey: 'importCSv',
                iconProps: { iconName: 'Import' },
                onClick: this.props.onImport,
                disabled: this.props.importDisabled
            },
            {
                key: "exportCsv",
                text: "Export to CSV",
                cacheKey: 'exportCsvCache',
                iconProps: { iconName: 'Export' },
                onClick: this.props.onExport
            }
        ]
    }

    public render() {
        return (
            <CommandBar
                items={this._menuItems}
                ariaLabel="Use left and right arrow keys to navigate between commands"
            />
        );
    }
}