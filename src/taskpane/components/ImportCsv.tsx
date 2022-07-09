import * as React from "react";
import { Stack } from "office-ui-fabric-react/lib/Stack";

import { VERTICAL_STACK_TOKENS } from "../utils/constants";
import { CSVReader } from "react-papaparse";
import { IGlossaryItem } from "../types/glossary";
import { MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { DefaultButton, PrimaryButton } from "office-ui-fabric-react/lib/components/Button";
import { ChoiceGroup, IChoiceGroupOption } from "office-ui-fabric-react/lib/components/ChoiceGroup";
import { Dialog, DialogFooter, DialogType } from "office-ui-fabric-react/lib/components/Dialog";

export interface IImportCsvProps {
  onImported: (data: IGlossaryItem[], importMethod: ImportMethod) => any;
  onCancel: () => any;
  notify: (message: string, messageType?: MessageBarType) => any;
}

export enum ImportMethod {
  Append,
  Replace
}

export default class ImportCsv extends React.Component<IImportCsvProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      importedItems: [],
      importMethod: ImportMethod.Append,
      hideDialog: true
    };
    this._handleOnDrop = this._handleOnDrop.bind(this);
    this._handleOnError = this._handleOnError.bind(this);
  }

  private async _handleOnDrop(data: any[]) {
    const items: IGlossaryItem[] =
      data?.map(item => {
        return {
          original: item.data[0],
          translation: item.data[1],
          note: item.data[2]
        };
      }) ?? [];

    this.setState({
      importedItems: [...items]
    });
  }

  private _handleOnError(err, file) {
    this.props.notify(`File import failed: ${file}`, MessageBarType.error);
    console.error(err);
  }

  _onSave = async (): Promise<void> => {
    await this.props.onImported(this.state.importedItems, this.state.importMethod);
  };

  _onImportMethodChange = (_: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption): void => {
    this.setState({
      importMethod: ImportMethod[option.text]
    });
  };

  _showDialog = () => {
    this.setState({
      hideDialog: false
    });
  };

  _hideDialog = () => {
    this.setState({
      hideDialog: true
    });
  };

  public render(): React.ReactNode {
    const options: IChoiceGroupOption[] = [
      { key: "A", text: ImportMethod[ImportMethod.Append] },
      { key: "B", text: ImportMethod[ImportMethod.Replace] }
    ];

    const dialogContentProps = {
      type: DialogType.normal,
      title: "Confirm import",
      subText: `Are you sure to ${ImportMethod[this.state.importMethod]} glossary with ${
        this.state.importedItems?.length
      } items?`
    };

    return (
      <>
        <Stack verticalAlign="center" tokens={VERTICAL_STACK_TOKENS}>
          <CSVReader
            onDrop={this._handleOnDrop}
            onError={this._handleOnError}
            addRemoveButton
            accept="text/csv, .csv"
            onRemoveFile={this._handleOnDrop}
          >
            <span>Drop CSV file here or click to upload</span>
          </CSVReader>
        </Stack>
        <Stack horizontal horizontalAlign="center">
          <ChoiceGroup
            defaultSelectedKey="A"
            options={options}
            onChange={this._onImportMethodChange}
            label="Choose import method"
            required={true}
          />
        </Stack>
        <Stack horizontal horizontalAlign="center" tokens={{ childrenGap: 25, padding: 10 }}>
          <Stack.Item>
            <DefaultButton text="Cancel" onClick={this.props.onCancel} />
          </Stack.Item>
          <Stack.Item>
            <PrimaryButton text="Import" disabled={!this.state.importedItems.length} onClick={this._showDialog} />
          </Stack.Item>
        </Stack>
        <Dialog
          hidden={this.state.hideDialog}
          onDismiss={this._hideDialog}
          dialogContentProps={dialogContentProps}
          modalProps={{ isBlocking: true }}
        >
          <DialogFooter>
            <PrimaryButton onClick={this._onSave} text="Sure" />
            <DefaultButton onClick={this._hideDialog} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </>
    );
  }
}
