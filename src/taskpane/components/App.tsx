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
import ImportCsv from "./ImportCsv";
import Search from "./Search";
import DocumentService from "../services/DocumentService";

export interface IAppProps {
  isOfficeInitialized: boolean;
}

export enum ItemFormMode {
  edit,
  create
}

export interface IAppState {
  glossary?: IGlossary;
  notification: INotification;
  showItemForm: boolean;
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
      itemFormMode: ItemFormMode.create,
      selectedItem: null,
      import: false,
      itemsToShow: []
    };

    this.serializer = new GlossaryXmlSerializer(XMLNS);
    this.glossaryStore = new CustomXmlStorageService(this.serializer);
    this.documentService = new DocumentService();

    this.bindMethodsToThis();
  }

  private bindMethodsToThis() {
    this.onItemFormSubmit = this.onItemFormSubmit.bind(this);
    this.onItemFormCancel = this.onItemFormCancel.bind(this);
    this.onEditWord = this.onEditWord.bind(this);
    this.insertWord = this.insertWord.bind(this);
    this.setNotification = this.setNotification.bind(this);
    this.clearNotification = this.clearNotification.bind(this);
    this.onSaveGlossary = this.onSaveGlossary.bind(this);
    this.loadGlossaryFromDoc = this.loadGlossaryFromDoc.bind(this);
    this.onNewItem = this.onNewItem.bind(this);
    this.onCreateGlossary = this.onCreateGlossary.bind(this);
    this.onImport = this.onImport.bind(this);
    this.onImported = this.onImported.bind(this);
    this.search = this.search.bind(this);
  }

  onNewItem(): boolean {
    this.setState({
      selectedItem: null,
      showItemForm: !this.state.showItemForm,
      itemFormMode: ItemFormMode.create
    });
    return true;
  }

  onEditWord(item: IGlossaryItem): void {
    this.setState({
      selectedItem: item,
      showItemForm: true,
      itemFormMode: ItemFormMode.edit
    });
  }

  onItemFormCancel(): void {
    this.setState({
      selectedItem: null,
      showItemForm: false,
      itemFormMode: ItemFormMode.create
    });
  }

  onItemFormSubmit(word: IGlossaryItem): void {
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
      this.setNotification("Glossary updated", MessageBarType.success);
    });
    this.setState({
      showItemForm: false,
      itemFormMode: ItemFormMode.create,
      glossary: this.glossary.current,
      itemsToShow: [...this.glossary.current.items]
    });
  }

  onCreateGlossary(source: Language, target: Language) {
    this.glossary.current = new Glossary(source, target);
    this.setState({
      glossary: this.glossary.current,
      itemsToShow: [...this.glossary.current.items]
    });
  }

  setNotification(message: string, messageType?: MessageBarType) {
    this.setState({
      notification: {
        message: message,
        messageBarType: !messageType ? MessageBarType.info : messageType
      }
    });
  }

  clearNotification(): void {
    this.setNotification(undefined);
  }

  onSaveGlossary(): boolean {
    this.glossaryStore
      .saveAsync(this.state.glossary)
      .then(_ => {
        this.setNotification("Saved successfully.", MessageBarType.success);
      })
      .catch(err => {
        console.log(err);
        this.setNotification("Saving failed!", MessageBarType.error);
      });
    return true;
  }

  loadGlossaryFromDoc(): void {
    this.glossaryStore
      .loadAsync()
      .then(loadedGlossary => {
        this.glossary.current = loadedGlossary;
        this.setState({
          glossary: this.glossary.current,
          itemsToShow: this.glossary.current.items,
          notification: {
            message: "Loaded successfully",
            messageBarType: MessageBarType.success
          }
        });
      })
      .catch(reason => {
        this.setState({
          notification: {
            message: reason,
            messageBarType: MessageBarType.error
          }
        });
      });
  }

  onImported(items: IGlossaryItem[]) {
    this.glossary.current.addRange(items);
    this.setState({
      import: false,
      glossary: this.glossary.current,
      itemsToShow: this.glossary.current.items
    });
    this.glossaryStore.saveAsync(this.glossary.current).then(_ => {
      this.setNotification("Glossary updated", MessageBarType.success);
    });
  }

  onImport(): boolean {
    this.setState({
      import: !this.state.import
    });
    return true;
  }

  async insertWord(item: IGlossaryItem) {
    const success = await this.documentService.insertText(item.translation);
    if (!success) {
      this.setNotification("Insertion failed", MessageBarType.error);
    }
  }

  search(keyword: string, options: ISearchOptions): void {
    const filteredList = this.glossary.current.search(keyword, options);
    this.setState({
      itemsToShow: filteredList
    });
  }

  componentDidMount() {
    this.loadGlossaryFromDoc();
  }

  render() {
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
      <div>
        <Stack>
          {!!this.state.glossary && (
            <Stack.Item align="stretch">
              <ControlPanel onNew={this.onNewItem} onSave={this.onSaveGlossary} onImport={this.onImport} />
            </Stack.Item>
          )}

          {!!this.state.showItemForm && (
            <Stack.Item align="stretch" tokens={{ margin: 20 }}>
              <AddEdit
                onSubmit={this.onItemFormSubmit}
                onCancel={this.onItemFormCancel}
                notify={this.setNotification}
                item={this.state.selectedItem}
              ></AddEdit>
            </Stack.Item>
          )}

          {!!this.state.import && (
            <Stack.Item align="center">
              <ImportCsv onImported={this.onImported} notify={this.setNotification} />
            </Stack.Item>
          )}

          {!this.state.glossary &&
            <Stack.Item align="center">
              <NewGlossary createGlossary={this.onCreateGlossary}></NewGlossary>
            </Stack.Item>
          }

          {this.state.glossary && (
            <Stack.Item align="stretch">
              <Stack>
                <Stack.Item align="center">
                  <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">
                    Glossary
                  </h2>
                </Stack.Item>
                <Stack.Item align="stretch">
                  <Search onSearch={this.search}></Search>
                </Stack.Item>
                <Stack.Item align="stretch">
                  <GlossaryTable
                    source={this.state.glossary.source.name}
                    target={this.state.glossary.target.name}
                    items={this.state.itemsToShow}
                    onRowClick={this.insertWord}
                    onEditRow={this.onEditWord}
                    notify={this.setNotification}
                  ></GlossaryTable>
                </Stack.Item>
              </Stack>
            </Stack.Item>
          )}
        </Stack>

        <Stack {...notificationStackProps}>
          {!!this.state.notification.message && (
            <MessageBar
              messageBarType={this.state.notification.messageBarType}
              isMultiline={true}
              onDismiss={this.clearNotification}
              dismissButtonAriaLabel="Close"
            >
              {this.state.notification.message}
            </MessageBar>
          )}
        </Stack>
      </div>
    );
  }
}
