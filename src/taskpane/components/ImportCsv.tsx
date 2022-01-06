import { PrimaryButton } from "office-ui-fabric-react";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import React = require("react");
import { VERTICAL_STACK_TOKENS } from "../utils/constants";

export default class ImprtCsv extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            isFilePicked: false
        }
        this._onFileInputChange = this._onFileInputChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    private _onFileInputChange(event) {
        const file = event.target.files[0];
        this.setState({
            selectedFile: file,
            isFilePicked: true
        });
    }

    private _onSubmit() {
        console.info(`Import: ${this.state.selectedFile}`);
    }

    public render(): React.ReactNode {
        return (
            <Stack verticalAlign="center" tokens={VERTICAL_STACK_TOKENS}>
                <input type="file"
                    id="fileSelector"
                    name="fileSelector"
                    placeholder="Your Glossary.csv"
                    accept=".csv"
                    onChange={this._onFileInputChange} />
                <PrimaryButton text="Import" onClick={this._onSubmit} />
            </Stack>
        );
    }
}