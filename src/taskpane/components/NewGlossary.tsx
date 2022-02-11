import { Stack } from "office-ui-fabric-react/lib/Stack";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { Dropdown, IDropdownOption, IDropdownStyles } from "office-ui-fabric-react/lib/Dropdown";
import * as React from "react";

import { Language } from "../models/Language";
import { LANGUAGES, VERTICAL_STACK_TOKENS } from "../utils/constants";

export interface INewGlossaryProps {
  createGlossary: any;
}

export interface INewGlossaryState {
  source: Language;
  target: Language;
}

const languageDropdownStyle: Partial<IDropdownStyles> = { dropdown: { width: "80vw" } };

const options: IDropdownOption[] = LANGUAGES.map<IDropdownOption>(lang => {
  return { key: lang.abbreviation, text: lang.name, data: lang };
});

export default class NewGlossary extends React.Component<INewGlossaryProps, INewGlossaryState> {
  constructor(props) {
    super(props);
    this.state = {
      source: LANGUAGES[0],
      target: LANGUAGES[1]
    };
    this._onSourceSelection = this._onSourceSelection.bind(this);
    this._onTargetSelection = this._onTargetSelection.bind(this);
  }

  private _onCreate() {
    this.props.createGlossary(this.state.source, this.state.target);
  }

  private _onSourceSelection(_: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void {
    this.setState({
      source: item.data
    });
  }

  private _onTargetSelection(_: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void {
    this.setState({
      target: item.data
    });
  }

  render() {
    return (
      <Stack verticalAlign="center" tokens={VERTICAL_STACK_TOKENS}>
        <Dropdown
          label="Source language"
          selectedKey={this.state.source ? this.state.source.abbreviation : undefined}
          placeholder="Select source language"
          onChange={this._onSourceSelection}
          styles={languageDropdownStyle}
          options={options.filter(opt => opt.data !== this.state.target)}
        />
        <Dropdown
          label="Target language"
          selectedKey={this.state.target ? this.state.target.abbreviation : undefined}
          onChange={this._onTargetSelection}
          placeholder="Select target language"
          styles={languageDropdownStyle}
          options={options.filter(opt => opt.data !== this.state.source)}
        />
        <PrimaryButton text="Create" onClick={() => this._onCreate()} />
      </Stack>
    );
  }
}
