import * as React from "react";
import { Stack } from "office-ui-fabric-react";
import { IGlossaryItem } from "../types/glossary";
import { VERTICAL_STACK_TOKENS } from "../utils/constants";

export interface IExportCsvProps {
    items: IGlossaryItem[];
    refElement: HTMLInputElement;
}

export default class ExportCsv extends React.Component<IExportCsvProps, any> {
    constructor(props) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <Stack verticalAlign="center" tokens={VERTICAL_STACK_TOKENS}>

            </Stack>
        );
    }
}