
import { IContextualMenuItem } from "office-ui-fabric-react";
import { CommandBar, ICommandBarItemProps } from "office-ui-fabric-react/lib/CommandBar";
import React = require("react");

export interface IControlPanelProps {
    onNew(e: React.MouseEvent<HTMLElement, MouseEvent>, items?: IContextualMenuItem): boolean;
    onSave(e: React.MouseEvent<HTMLElement, MouseEvent>, items?: IContextualMenuItem): boolean;
    onLoad(e: React.MouseEvent<HTMLElement, MouseEvent>, items?: IContextualMenuItem): boolean;
}

export default class ControlPanel extends React.Component<IControlPanelProps> {
    private _menuItems: ICommandBarItemProps[];

    constructor(props) {
        super(props);
        this._menuItems = [
            {
                key: "newWord",
                text: "Új szó",
                cacheKey: 'newWordCache',
                iconProps: { iconName: 'Add' },
                onClick: this.props.onNew
            },
            {
                key: "saveMemory",
                text: "Mentés",
                cacheKey: 'saveMemoryCache',
                iconProps: { iconName: 'Save' },
                onClick: this.props.onSave
            },
            {
                key: "loadMemory",
                text: "Betöltés",
                cacheKey: 'loadMemoryCache',
                iconProps: { iconName: 'Upload' },
                onClick: this.props.onLoad
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