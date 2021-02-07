import { IStackProps, Stack } from "office-ui-fabric-react";
import { MessageBar } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar";
import { MessageBarType } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar.types";
import * as React from "react";
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";

import { IGlossary, IGlossaryStore, IGlossaryXmlSerializer, INotification } from "../types/glossary";
import StorageService from "../services/StorageService";
import { Glossary, Language } from "../models/Glossary";
import GlossaryXmlSerializer from "../utils/GlossaryXmlSerializer";
import { XMLNS } from "../utils/constants";

import ControlPanel from "./ControlPanel";
import NewItem from "./NewItem";
import GlossaryTable, { IGlossaryItem } from "./GlossaryTable";
import NewGlossary from "./NewGlossary";

export interface IAppProps {
  isOfficeInitialized: boolean;
}

export interface IAppState {
  glossary?: IGlossary;
  glossaryItems: IGlossaryItem[];
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
  private glossaryStore: IGlossaryStore;
  private serializer: IGlossaryXmlSerializer;
  
  constructor(props) {
    super(props);

    this.state = {
      glossary: null,
      glossaryItems: [],
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
    this.saveGlossary = this.saveGlossary.bind(this);
    this.load = this.load.bind(this);
    this.edit = this.edit.bind(this);
    this.createGlossary = this.createGlossary.bind(this);
  }

  edit(): boolean {
    this.setState({
      edit: !this.state.edit
    })
    return true;
  }

  addWord(word: IGlossaryItem) {
    this.setState({
      edit: false,
      glossaryItems: [...this.state.glossaryItems, word]
    });
  }

  createGlossary(source: Language, target: Language) {
    let glossary = new Glossary(source, target);
    this.setState({
      glossary: glossary
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

  saveGlossary(): boolean {
    this.glossaryStore.saveAsync(this.state.glossary).then((_) => {
      this.setNotification('Mentés sikeres.', MessageBarType.success);
    }).catch(err => {
      console.log(err);
      this.setNotification('Hiba történt!', MessageBarType.error);
    });
    return true;
  }

  load(): boolean {
    this.glossaryStore.loadAsync().then((loadedGlossary) =>{
      this.setState({
        glossary: loadedGlossary,
        notification: {
          message: 'Betöltés sikeres',
          messageBarType: MessageBarType.success
        }
      });
    });
    return true;
  }

  componentDidMount() {
    this.load();
  }

  render() {
    return (
      <div>
        <Stack tokens={{childrenGap: 10}}>
          <Stack.Item align="stretch">
              <ControlPanel onNew={this.edit} onLoad={this.load} onSave={this.saveGlossary} />
          </Stack.Item>

          {(!!this.state.edit) && <Stack.Item align="center">
              <NewItem addWord={this.addWord}></NewItem>
            </Stack.Item>
          }

          <Stack.Item align="center">
            {(!this.state.glossary) && <NewGlossary createGlossary={this.createGlossary}></NewGlossary>}
          </Stack.Item>
          
          <Stack.Item align="stretch">
            {(this.state.glossary) && <GlossaryTable items={this.state.glossaryItems} notify={this.setNotification}></GlossaryTable>}
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
