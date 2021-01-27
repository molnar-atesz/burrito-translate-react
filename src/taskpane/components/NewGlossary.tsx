import { Dropdown, IDropdownOption, IDropdownStyles, PrimaryButton, Stack } from "office-ui-fabric-react";
import React = require("react");
import { Language } from "../models/Glossary";
import { LANGUAGES, VERTICAL_STACK_TOKENS } from "../utils/constants";

export interface INewGlossaryProps {
    createGlossary: any
}

export interface INewGlossaryState {
    source: Language;
    target: Language;
}

const languageDropdownStyle: Partial<IDropdownStyles> = { dropdown: { width: 200 } };

const options: IDropdownOption[] = LANGUAGES.map<IDropdownOption>(lang => { 
                                                                    return { key: lang.abbreviation, text: lang.name, data: lang };
                                                                });

export default class NewGlossary extends React.Component<INewGlossaryProps, INewGlossaryState> {
    constructor(props) {
        super(props);
        this.state = {
            source: LANGUAGES[0],
            target: LANGUAGES[1]
        }
        this.selectSource = this.selectSource.bind(this);
        this.selectTarget = this.selectTarget.bind(this);
    }

    private create() {
        this.props.createGlossary(this.state.source, this.state.target);
    }

    private selectSource(_: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void {
        this.setState({
            source: item.data
        });
    }

    private selectTarget(_: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void {
        this.setState({
            target: item.data
        });
    }

    render(){
        return (
            <Stack verticalAlign="center" tokens={VERTICAL_STACK_TOKENS}>
                <Dropdown label="Source language"
                        selectedKey={this.state.source ? this.state.source.abbreviation : undefined}
                        placeholder="Select source language"
                        onChange={this.selectSource}
                        styles={languageDropdownStyle}
                        options={options} />
                <Dropdown label="Target language"
                        selectedKey={this.state.target ? this.state.target.abbreviation : undefined}
                        onChange={this.selectTarget}
                        placeholder="Select target language"
                        styles={languageDropdownStyle}
                        options={options} />
                <PrimaryButton text="Create" onClick={ () => this.create() } />
            </Stack>
        );
    }
}