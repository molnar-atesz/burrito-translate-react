import * as React from "react";
import { Stack } from "office-ui-fabric-react/lib/Stack";

import { VERTICAL_STACK_TOKENS } from "../utils/constants";
import { CSVReader } from "react-papaparse";
import { IGlossaryItem } from "../types/glossary";
import { MessageBarType } from "office-ui-fabric-react/lib/MessageBar";

export interface IImportCsvProps {
  onImported: (data: IGlossaryItem[]) => any;
  notify: (message: string, messageType?: MessageBarType) => any;
}

export default class ImportCsv extends React.Component<IImportCsvProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      importedData: null
    };
    this._handleOnDrop = this._handleOnDrop.bind(this);
    this._handleOnError = this._handleOnError.bind(this);
  }

  private _handleOnDrop(data: any[]) {
    const items: IGlossaryItem[] = data.map(item => {
      return {
        original: item.data[0],
        translation: item.data[1],
        note: item.data[2]
      };
    });
    console.log("Data loaded");
    console.log(items);
    this.props.onImported(items);
  }

  private _handleOnError(err, file) {
    this.props.notify(`File import failed: ${file}`, MessageBarType.error);
    console.log(err);
  }

  public render(): React.ReactNode {
    return (
      <Stack verticalAlign="center" tokens={VERTICAL_STACK_TOKENS}>
        <CSVReader onDrop={this._handleOnDrop} onError={this._handleOnError} addRemoveButton accept="text/csv, .csv">
          <span>Drop CSV file here or click to upload</span>
        </CSVReader>
      </Stack>
    );
  }
}
