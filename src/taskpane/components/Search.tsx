import { Checkbox, IconButton, IStackProps, IStackTokens, SearchBox, Stack } from "office-ui-fabric-react";
import * as React from "react";

import { ISearchOptions } from "../types/glossary";

export interface ISearchProps {
  onSearch(keyword: string, options: ISearchOptions): void;
}

export interface ISearchState {
  keyword: string;
  showSearchOptions: boolean;
  searchOptions: ISearchOptions;
}

export default class Search extends React.Component<ISearchProps, ISearchState> {
  constructor(props) {
    super(props);

    this.state = {
      keyword: "",
      showSearchOptions: false,
      searchOptions: {
        caseSensitive: false,
        wholeWord: false
      }
    };
  }

  public render = (): React.ReactNode => {
    const stackProps: IStackProps = {
      root: {
        style: {
          padding: "10px"
        }
      }
    };
    const stackTokens: IStackTokens = {
      childrenGap: 5
    };

    return (
      <Stack tokens={{ childrenGap: 5 }} {...stackProps}>
        <Stack.Item>
          <Stack horizontal>
            <Stack.Item grow>
              <SearchBox placeholder="Search" onChange={this._onSearchTextChanged} value={this.state.keyword} />
            </Stack.Item>
            <Stack.Item disableShrink>
              <IconButton
                iconProps={{ iconName: "Settings" }}
                title="Advanced search options"
                ariaLabel="Advanced search options"
                onClick={this._showSearchOptions}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
        {this.state.showSearchOptions && (
          <Stack horizontal horizontalAlign="center" tokens={stackTokens} {...stackProps}>
            <Stack.Item>
              <Checkbox label="Case sensitive" onChange={this._caseSensitivityChanged} />
            </Stack.Item>
            <Stack.Item>
              <Checkbox label="Whole word only" onChange={this._wholeWordChanged} />
            </Stack.Item>
          </Stack>
        )}
      </Stack>
    );
  };

  private _showSearchOptions = (): void => {
    this.setState({
      showSearchOptions: !this.state.showSearchOptions
    });
  };

  private _caseSensitivityChanged = (_: React.FormEvent<HTMLElement>, isChecked: boolean): void => {
    let options = { ...this.state.searchOptions };
    options.caseSensitive = isChecked;

    this.setState({
      searchOptions: options
    });
    this.props.onSearch(this.state.keyword, options);
  };

  private _wholeWordChanged = (_: React.FormEvent<HTMLElement>, isChecked: boolean): void => {
    let options = { ...this.state.searchOptions };
    options.wholeWord = isChecked;

    this.setState({
      searchOptions: options
    });
    this.props.onSearch(this.state.keyword, options);
  };

  private _onSearchTextChanged = (
    _: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    keyword: string
  ): void => {
    this.setState({
      keyword: keyword
    });
    this.props.onSearch(keyword, this.state.searchOptions);
  };
}
