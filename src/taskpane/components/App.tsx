import { IStackProps, Stack } from "office-ui-fabric-react";
import { MessageBar } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar";
import { MessageBarType } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar.types";
import * as React from "react";
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";
import StorageService from "../services/StorageService";
import ControlPanel from "./ControlPanel";
import NewItem from "./NewItem";
import TranslationMemory, { ITranslationMemoryItem } from "./TranslationMemory";

export interface INotificationProps {
  message: string;
  messageBarType: MessageBarType
}

export interface IAppProps {
  isOfficeInitialized: boolean;
}

export interface IAppState {
  memory: ITranslationMemoryItem[];
  notification: INotificationProps,
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
  constructor(props, context) {
    super(props, context);
    this.state = {
      memory: [],
      notification: {
        message: '',
        messageBarType: MessageBarType.info
      },
      edit: false
    };

    this.addWord = this.addWord.bind(this);
    this.setNotification = this.setNotification.bind(this);
    this.saveMemory = this.saveMemory.bind(this);
    this.load = this.load.bind(this);
    this.edit = this.edit.bind(this);
  }

  edit(): boolean {
    this.setState({
      edit: !this.state.edit
    })
    return true;
  }

  addWord(word: ITranslationMemoryItem) {
    this.setState({
      edit: false,
      memory: [...this.state.memory, word]
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

  saveMemory(): boolean {
    StorageService.saveTranslationMemory(this.state.memory).then((_) => {
      this.setNotification('Mentés sikeres.', MessageBarType.success);
    }).catch(err => {
      console.log(err);
      this.setNotification('Hiba történt', MessageBarType.error);
    });
    return true;
  }

  load(): boolean {
    StorageService.loadTranslationMemory().then((mem) =>{
      this.setState({
        memory: mem,
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
              <ControlPanel onNew={this.edit} onLoad={this.load} onSave={this.saveMemory} />
          </Stack.Item>
          {(!!this.state.edit) && <Stack.Item align="center">
              <NewItem addWord={this.addWord}></NewItem>
            </Stack.Item>
          }
          <Stack.Item align="stretch">
              <TranslationMemory items={this.state.memory} notify={this.setNotification}></TranslationMemory>
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
