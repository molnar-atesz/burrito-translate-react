import * as React from "react";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { IStackProps, Stack } from "office-ui-fabric-react/lib/Stack";
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";

import {
  IGlossary,
  IGlossaryItem,
  IGlossaryStore,
  IGlossaryXmlSerializer,
  INotification,
  ISearchOptions
} from "../types/glossary";
import CustomXmlStorageService from "../services/CustomXmlStorageService";
import { Glossary } from "../models/Glossary";
import { Language } from "../models/Language";
import GlossaryXmlSerializer from "../utils/GlossaryXmlSerializer";
import { XMLNS } from "../utils/constants";

import ControlPanel from "./ControlPanel";
import AddEdit from "./AddEdit";
import GlossaryTable from "./GlossaryTable";
import NewGlossary from "./NewGlossary";
import ImportCsv, { ImportMethod } from "./ImportCsv";
import Search from "./Search";
import DocumentService from "../services/DocumentService";
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  PrimaryButton,
  ScrollablePane,
  Sticky,
  StickyPositionType
} from "office-ui-fabric-react";
import { CSVDownloader } from "react-papaparse";

export enum ItemFormMode {
  edit,
  create
}

export interface IAppProps {
  isOfficeInitialized: boolean;
}

export interface IAppState {
  glossary?: IGlossary;
  notification: INotification;
  showItemForm: boolean;
  hideDeleteDialog: boolean;
  itemFormMode: ItemFormMode;
  selectedItem: IGlossaryItem;
  import: boolean;
  itemsToShow: IGlossaryItem[];
}

export default class App extends React.Component<IAppProps, IAppState> {
  private readonly glossaryStore: IGlossaryStore;
  private readonly serializer: IGlossaryXmlSerializer;
  private readonly documentService: DocumentService;
  private glossary: React.MutableRefObject<IGlossary>;
  private csvDownloderButton: CSVDownloader;

  constructor(props) {
    super(props);
    this.glossary = React.createRef();

    this.state = {
      glossary: null,
      notification: {
        message: "",
        messageBarType: MessageBarType.info
      },
      showItemForm: false,
      hideDeleteDialog: true,
      itemFormMode: ItemFormMode.create,
      selectedItem: null,
      import: false,
      itemsToShow: []
    };

    this.serializer = new GlossaryXmlSerializer(XMLNS);
    this.glossaryStore = new CustomXmlStorageService(this.serializer);
    this.documentService = new DocumentService();
  }

  private _onNewItem = (): boolean => {
    this.setState({
      selectedItem: null,
      showItemForm: !this.state.showItemForm,
      itemFormMode: ItemFormMode.create
    });
    return true;
  };

  private _onEditItem = (item: IGlossaryItem): void => {
    this.setState({
      selectedItem: item,
      showItemForm: true,
      itemFormMode: ItemFormMode.edit
    });
  };

  private _onDeleteItem = (item: IGlossaryItem): void => {
    this.setState({
      selectedItem: item,
      hideDeleteDialog: false
    });
  };

  private _hideDeleteDialog = (): void => {
    this.setState({
      selectedItem: null,
      hideDeleteDialog: true
    });
  };

  private _confirmDeletion = async (): Promise<void> => {
    this.glossary.current.deleteItem(this.state.selectedItem.original);
    await this.glossaryStore.saveAsync(this.glossary.current);
    this._refreshGlossaryState();
    this._hideDeleteDialog();
  };

  private _onItemFormCancel = (): void => {
    this.setState({
      selectedItem: null,
      showItemForm: false,
      itemFormMode: ItemFormMode.create
    });
  };

  private _onItemFormSubmit = (word: IGlossaryItem): void => {
    switch (this.state.itemFormMode) {
      case ItemFormMode.create:
        this.glossary.current.addItem(word);
        break;
      case ItemFormMode.edit:
        this.glossary.current.editItem(word.original, word.translation, word.note);
        break;
      default:
        break;
    }
    this.glossaryStore.saveAsync(this.glossary.current).then(_ => {
      this._setNotification("Glossary updated", MessageBarType.success);
    });
    this.setState({
      showItemForm: false,
      itemFormMode: ItemFormMode.create,
      glossary: this.glossary.current,
      itemsToShow: [...this.glossary.current.items]
    });
  };

  private _onCreateGlossary = (source: Language, target: Language): void => {
    this.glossary.current = new Glossary(source, target);
    this._refreshGlossaryState();
  };

  private _setNotification = (message: string, messageType?: MessageBarType): void => {
    this.setState({
      notification: {
        message: message,
        messageBarType: !messageType ? MessageBarType.info : messageType
      }
    });
    if (!!message) {
      setTimeout(this._clearNotification, 3000);
    }
  };

  private _clearNotification = (): void => {
    this._setNotification(undefined);
  };

  private _onSaveGlossary = (): boolean => {
    this.glossaryStore
      .saveAsync(this.state.glossary)
      .then(_ => {
        this._setNotification("Saved successfully.", MessageBarType.success);
      })
      .catch(err => {
        console.log(err);
        this._setNotification("Saving failed!", MessageBarType.error);
      });
    return true;
  };

  private _loadGlossaryFromDoc = (): void => {
    this.glossaryStore
      .loadAsync()
      .then(loadedGlossary => {
        this.glossary.current = loadedGlossary;
        this._refreshGlossaryState();
        this._setNotification("Loaded successfully", MessageBarType.success);
      })
      .catch(reason => {
        this._setNotification(reason, MessageBarType.info);
      });
  };

  private _onImported = async (items: IGlossaryItem[], importMethod: ImportMethod): Promise<void> => {
    if (importMethod === ImportMethod.Replace) {
      this.glossary.current.clear();
    }
    this.glossary.current.addRange(items);
    await this.glossaryStore.saveAsync(this.glossary.current);

    this._setNotification("Glossary updated", MessageBarType.success);
    this._refreshGlossaryState();
    this.setState({
      import: false
    });
  };

  private _onCancelImport = (): void => {
    this.setState({
      import: false
    });
  };

  private _onImport = (): boolean => {
    this.setState({
      import: !this.state.import
    });
    return true;
  };

  private _refreshGlossaryState = (): void => {
    this.setState({
      glossary: this.glossary.current,
      itemsToShow: [...this.glossary.current.items]
    });
  };

  private _onExport = (): boolean => {
    const exportData = this.state.glossary.items.map(item => {
      return {
        original: item.original,
        translation: item.translation,
        note: item.note
      };
    });
    this.csvDownloderButton.download(exportData, "glossary-export", true, {
      header: false
    });
    return true;
  };

  private _insertWord = async (item: IGlossaryItem): Promise<void> => {
    const success = await this.documentService.insertText(item.translation);
    if (!success) {
      this._setNotification("Insertion failed", MessageBarType.error);
    }
  };

  private _search = (keyword: string, options: ISearchOptions): void => {
    const filteredList = this.glossary.current.search(keyword, options);
    this.setState({
      itemsToShow: filteredList
    });
  };

  componentDidMount() {
    this._loadGlossaryFromDoc();
  }

  public render(): React.ReactNode {
    const dialogContentProps = {
      type: DialogType.normal,
      title: "Delete item",
      subText: `Are you sure you want to delete this item: ${this.state.selectedItem?.original}?`
    };
    const notificationStackProps: IStackProps = {
      styles: {
        root: {
          overflow: "hidden",
          width: "100%",
          position: "absolute",
          bottom: "0px"
        }
      },
      verticalAlign: "end"
    };

    return (
      <ScrollablePane>
        <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
          <Stack>
            {!!this.state.glossary && (
              <Stack.Item align="stretch">
                <ControlPanel
                  onNew={this._onNewItem}
                  onSave={this._onSaveGlossary}
                  onImport={this._onImport}
                  onExport={this._onExport}
                />
              </Stack.Item>
            )}

            {!!this.state.showItemForm && (
              <Stack.Item align="stretch" tokens={{ margin: 20 }}>
                <AddEdit
                  onSubmit={this._onItemFormSubmit}
                  onCancel={this._onItemFormCancel}
                  notify={this._setNotification}
                  item={this.state.selectedItem}
                ></AddEdit>
              </Stack.Item>
            )}

            {!!this.state.import && (
              <Stack.Item align="center">
                <ImportCsv
                  onImported={this._onImported}
                  notify={this._setNotification}
                  onCancel={this._onCancelImport}
                />
              </Stack.Item>
            )}

            {!this.state.glossary && (
              <Stack.Item align="center">
                <NewGlossary createGlossary={this._onCreateGlossary}></NewGlossary>
              </Stack.Item>
            )}

            {this.state.glossary && (
              <>
                <Stack.Item align="center">
                  <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">
                    Glossary
                  </h2>
                </Stack.Item>
                <Stack.Item align="stretch">
                  <Search onSearch={this._search}></Search>
                </Stack.Item>
              </>
            )}
          </Stack>
        </Sticky>

        {this.state.glossary && (
          <Stack>
            <Stack.Item align="stretch">
              <GlossaryTable
                source={this.state.glossary.source.name}
                target={this.state.glossary.target.name}
                items={this.state.itemsToShow}
                onRowClick={this._insertWord}
                onEditRow={this._onEditItem}
                onDeleteRow={this._onDeleteItem}
                notify={this._setNotification}
              ></GlossaryTable>
            </Stack.Item>
          </Stack>
        )}

        <Sticky stickyPosition={StickyPositionType.Footer}>
          <Stack {...notificationStackProps}>
            {!!this.state.notification.message && (
              <MessageBar
                messageBarType={this.state.notification.messageBarType}
                isMultiline={true}
                onDismiss={this._clearNotification}
                dismissButtonAriaLabel="Close"
              >
                {this.state.notification.message}
              </MessageBar>
            )}
          </Stack>
        </Sticky>

        <Dialog
          hidden={this.state.hideDeleteDialog}
          onDismiss={this._hideDeleteDialog}
          dialogContentProps={dialogContentProps}
          modalProps={{ isBlocking: true }}
        >
          <DialogFooter>
            <PrimaryButton onClick={this._confirmDeletion} text="Delete" />
            <DefaultButton onClick={this._hideDeleteDialog} text="Cancel" />
          </DialogFooter>
        </Dialog>

        {!!this.state.glossary && (
          <CSVDownloader
            ref={exporter => (this.csvDownloderButton = exporter)}
            style={{
              display: "none"
            }}
          >
            Export glossary
          </CSVDownloader>
        )}
      </ScrollablePane>
    );
  }
}
