import { PrimaryButton, TextField } from "office-ui-fabric-react";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import React = require("react");
import { IGlossaryItem } from "./Glossary";

const stackTokens = { childrenGap: 5 };

export interface INewItemProps {
    addWord: any
}

export default class NewItem extends React.Component<INewItemProps, IGlossaryItem | any> {
    constructor(props) {
        super(props);
        this.state = { 
            hu: "",
            en: "",
            note: ""
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    private handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        this.setState({
            [name]: target.value
        });
    }

    private save() {
        const normalized = {
            hu: this.state.hu.trim(),
            en: this.state.en.trim(),
            note: this.state.note?.trim()
        }
        this.props.addWord(normalized);
        this.setState({ hu:"", en:"", note:"" });
    }

    public render() {
        return (
            <Stack verticalAlign="center" tokens={stackTokens}>
                <TextField label="Angol" name="en" value={this.state.en} onChange={this.handleInputChange} />
                <TextField label="Magyar" name="hu" value={this.state.hu} onChange={this.handleInputChange} />
                <TextField label="Megjegyzés" name="note" multiline rows={3} value={this.state.note} onChange={this.handleInputChange} />
                <PrimaryButton text="Hozzáadás" onClick={ () => this.save() } />
            </Stack>
        );
    }
}