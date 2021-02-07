import { IStackProps, Stack } from "office-ui-fabric-react";
import { MessageBar } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar";
import { MessageBarType } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar.types";
import * as React from "react";
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";

import { IGlossary, IGlossaryItem, IGlossaryStore, IGlossaryXmlSerializer, INotification } from "../types/glossary";
import StorageService from "../services/StorageService";
import { Glossary, Language } from "../models/Glossary";
import GlossaryXmlSerializer from "../utils/GlossaryXmlSerializer";
import { XMLNS } from "../utils/constants";

import ControlPanel from "./ControlPanel";
import NewItem from "./NewItem";
import GlossaryTable from "./GlossaryTable";
import NewGlossary from "./NewGlossary";

export interface IAppProps {
  isOfficeInitialized: boolean;
}

export interface IAppState {
  glossary?: IGlossary;
  notification: INotification,
  edit: boolean
}

const verticalStackProps: IStackProps = {
  styles: { 
    root: { 
      overflow: 'hidden',
      width: '100%',
      position: "absolute",
      bottom: '0px'
    }
  },
  verticalAlign: "end"
}

export default class App extends React.Component<IAppProps, IAppState> {
  private readonly glossaryStore: IGlossaryStore;
  private readonly serializer: IGlossaryXmlSerializer;
  private glossary: IGlossary;
  
  constructor(props) {
    super(props);

    this.state = {
      glossary: null,
      notification: {
        message: '',
        messageBarType: MessageBarType.info
      },
      edit: false
    };

    this.serializer = new GlossaryXmlSerializer(XMLNS);
    this.glossaryStore = new StorageService(this.serializer);

    this.bindMethodsToThis();
  }

  private bindMethodsToThis() {
    this.addWord = this.addWord.bind(this);
    this.setNotification = this.setNotification.bind(this);
    this.onSaveGlossary = this.onSaveGlossary.bind(this);
    this.onLoadGlossary = this.onLoadGlossary.bind(this);
    this.onEditMode = this.onEditMode.bind(this);
    this.onCreateGlossary = this.onCreateGlossary.bind(this);
  }

  onEditMode(): boolean {
    this.setState({
      edit: !this.state.edit
    })
    return true;
  }

  addWord(word: IGlossaryItem) {
    this.glossary.addItem(word);
    this.setState({
      edit: false,
      glossary: { ...this.state.glossary, items: this.glossary.items }
    });
  }

  onCreateGlossary(source: Language, target: Language) {
    this.glossary = new Glossary(source, target);
    this.setState({
      glossary: this.glossary
    });
  }

  setNotification(message: string, messageType?: MessageBarType) {
    this.setState({
      notification: {
        message: message,
        messageBarType: (!messageType) ? MessageBarType.info : messageType
      }
    });
  }

  onSaveGlossary(): boolean {
    this.glossaryStore.saveAsync(this.state.glossary).then((_) => {
      this.setNotification('Saved successfully.', MessageBarType.success);
    }).catch(err => {
      console.log(err);
      this.setNotification('Saving failed!', MessageBarType.error);
    });
    return true;
  }

  onLoadGlossary(): boolean {
    this.glossaryStore.loadAsync().then((loadedGlossary) =>{
      this.setState({
        glossary: loadedGlossary,
        notification: {
          message: 'Loaded successfully',
          messageBarType: MessageBarType.success
        }
      });
    });
    return true;
  }

  componentDidMount() {
    this.onLoadGlossary();
  }

  render() {
    return (
      <div>
        <Stack tokens={{childrenGap: 10}}>
          <Stack.Item align="stretch">
              <ControlPanel onNew={this.onEditMode} onLoad={this.onLoadGlossary} onSave={this.onSaveGlossary} />
          </Stack.Item>

          {(!!this.state.edit) && <Stack.Item align="center">
              <NewItem addWord={this.addWord}></NewItem>
            </Stack.Item>
          }

          <Stack.Item align="center">
            {(!this.state.glossary) && <NewGlossary createGlossary={this.onCreateGlossary}></NewGlossary>}
          </Stack.Item>
          
          <Stack.Item align="stretch">
            {(this.state.glossary) && <GlossaryTable glossary={this.state.glossary} notify={this.setNotification}></GlossaryTable>}
          </Stack.Item>
        </Stack>

        <Stack {...verticalStackProps}>
            {(!!this.state.notification.message) && <MessageBar
              messageBarType={this.state.notification.messageBarType}
              isMultiline={true}
              onDismiss={() => this.setNotification(undefined)}
              dismissButtonAriaLabel="Close"
              >
              {this.state.notification.message}
            </MessageBar>}
        </Stack>
      </div>
    );
  }
}
