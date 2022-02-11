import * as React from "react";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { MessageBarType } from "office-ui-fabric-react/lib/MessageBar";

import { IGlossaryItem } from "../types/glossary";
import { VERTICAL_STACK_TOKENS } from "../utils/constants";

export interface IAddEditProps {
  onSubmit: any;
  onCancel(e: React.MouseEvent<HTMLElement, MouseEvent>): any;
  notify(message: string, messageType?: MessageBarType): any;
  item?: IGlossaryItem;
}

export default class AddEdit extends React.Component<IAddEditProps, IGlossaryItem | any> {
  constructor(props: IAddEditProps) {
    super(props);
    this.state = !!props.item ? props.item : { key: "", original: "", translation: "", note: "" };
    this._onInputChange = this._onInputChange.bind(this);
    this._onSave = this._onSave.bind(this);
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
    };
    if (normalized.original.length == 0) {
      this.props.notify("Original word should not be empty!", MessageBarType.error);
    } else {
      this.props.onSubmit(normalized);
      this.setState({ original: "", translation: "", note: "" });
    }
  }

  public render() {
    return (
      <Stack verticalAlign="stretch" tokens={VERTICAL_STACK_TOKENS}>
        <TextField label="Word" name="original" value={this.state.original} onChange={this._onInputChange} disabled={!!this.props.item} />
        <TextField
          label="Translation"
          name="translation"
          value={this.state.translation}
          onChange={this._onInputChange}
        />
        <TextField label="Note" name="note" multiline rows={3} value={this.state.note} onChange={this._onInputChange} />
        <Stack horizontal verticalAlign="stretch">
          <Stack.Item>
            <DefaultButton text="Cancel" onClick={this.props.onCancel} />
          </Stack.Item>
          <Stack.Item>
            <PrimaryButton text="Submit" onClick={() => this._onSave()} />
          </Stack.Item>
        </Stack>
      </Stack>
    );
  }
}
