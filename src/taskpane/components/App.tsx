import * as React from "react";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { IStackProps, Stack } from "office-ui-fabric-react/lib/Stack";
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";

import { IGlossary, IGlossaryItem, IGlossaryStore, IGlossaryXmlSerializer, INotification, ISearchOptions } from "../types/glossary";
import CustomXmlStorageService from "../services/CustomXmlStorageService";
import { Glossary, Language } from "../models/Glossary";
import GlossaryXmlSerializer from "../utils/GlossaryXmlSerializer";
import { XMLNS } from "../utils/constants";

import ControlPanel from "./ControlPanel";
import NewItem from "./NewItem";
import GlossaryTable from "./GlossaryTable";
import NewGlossary from "./NewGlossary";
import ImportCsv from "./ImportCsv";
import Search from "./Search";
import DocumentService from "../services/DocumentService";

export interface IAppProps {
  isOfficeInitialized: boolean;
}

export interface IAppState {
  glossary?: IGlossary;
  notification: INotification;
  edit: boolean;
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
      edit: false,
      import: false,
      itemsToShow: []
    };

    this.serializer = new GlossaryXmlSerializer(XMLNS);
    this.glossaryStore = new CustomXmlStorageService(this.serializer);
    this.documentService = new DocumentService();

    this.bindMethodsToThis();
  }

  private bindMethodsToThis() {
    this.addWord = this.addWord.bind(this);
    this.insertWord = this.insertWord.bind(this);
    this.setNotification = this.setNotification.bind(this);
    this.clearNotification = this.clearNotification.bind(this);
    this.onSaveGlossary = this.onSaveGlossary.bind(this);
    this.loadGlossaryFromDoc = this.loadGlossaryFromDoc.bind(this);
    this.onEditMode = this.onEditMode.bind(this);
    this.onCreateGlossary = this.onCreateGlossary.bind(this);
    this.onImport = this.onImport.bind(this);
    this.onImported = this.onImported.bind(this);
    this.search = this.search.bind(this);
  }

  onEditMode(): boolean {
    this.setState({
      edit: !this.state.edit
    });
    return true;
  }

  addWord(word: IGlossaryItem) {
    try {
      this.glossary.current.addItem(word);
      this.setState({
        edit: false,
        glossary: this.glossary.current,
        itemsToShow: [...this.glossary.current.items]
      });
      this.glossaryStore.saveAsync(this.glossary.current).then(_ => {
        this.setNotification("Glossary updated", MessageBarType.success);
      });
    } catch (error) {
      this.setNotification(error.message, MessageBarType.error);
    }
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
    this.glossaryStore.loadAsync().then(loadedGlossary => {
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
      .catch((reason) => {
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
        <Stack tokens={{ childrenGap: 10 }}>
          {!!this.state.glossary &&
            <Stack.Item align="stretch">
              <ControlPanel
                onNew={this.onEditMode}
                onSave={this.onSaveGlossary}
                onImport={this.onImport}
              />
            </Stack.Item>
          }

          {!!this.state.edit && (
            <Stack.Item align="center">
              <NewItem addWord={this.addWord} notify={this.setNotification}></NewItem>
            </Stack.Item>
          )}

          {!!this.state.import && (
            <Stack.Item align="center">
              <ImportCsv onImported={this.onImported} notify={this.setNotification} />
            </Stack.Item>
          )}

          <Stack.Item align="center">
            {!this.state.glossary && <NewGlossary createGlossary={this.onCreateGlossary}></NewGlossary>}
          </Stack.Item>

          <Stack.Item align="stretch">
            {this.state.glossary && (
              <Stack>
                <Stack.Item align="center">
                  <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">Glossary</h2>
                </Stack.Item>
                <Stack.Item align="stretch">
                  <Search onSearch={this.search}></Search>
                </Stack.Item>
                <Stack.Item align="stretch">
                  <GlossaryTable source={this.state.glossary.source.name}
                    target={this.state.glossary.target.name}
                    items={this.state.itemsToShow}
                    onRowClick={this.insertWord}
                    notify={this.setNotification}>
                  </GlossaryTable>
                </Stack.Item>
              </Stack>
            )}
          </Stack.Item>
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
