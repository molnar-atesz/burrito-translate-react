import { PrimaryButton, TextField } from "office-ui-fabric-react";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import React = require("react");
import { IGlossaryItem } from "../types/glossary";
import { VERTICAL_STACK_TOKENS } from "../utils/constants";

export interface INewItemProps {
    addWord: any
}

export default class NewItem extends React.Component<INewItemProps, IGlossaryItem | any> {
    constructor(props) {
        super(props);
        this.state = {
            key: "",
            original: "",
            translation: "",
            note: ""
        };
        this._onInputChange = this._onInputChange.bind(this);
    }

    private _onInputChange(event) {
        const target = event.target;
        const name = target.name;
        this.setState({
            [name]: target.value
        });
    }

    private _onSave() {
        const normalized = {
            original: this.state.original.trim(),
            translation: this.state.translation.trim(),
            note: this.state.note?.trim()
        }
        this.props.addWord(normalized);
        this.setState({ original:"", translation:"", note:"" });
    }

    public render() {
        return (
            <Stack verticalAlign="center" tokens={VERTICAL_STACK_TOKENS}>
                <TextField label="From" name="original" value={this.state.original} onChange={this._onInputChange} />
                <TextField label="Translation" name="translation" value={this.state.translation} onChange={this._onInputChange} />
                <TextField label="Note" name="note" multiline rows={3} value={this.state.note} onChange={this._onInputChange} />
                <PrimaryButton text="Add" onClick={ () => this._onSave() } />
            </Stack>
        );
    }
}