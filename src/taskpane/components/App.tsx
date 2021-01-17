import { IStackProps, Stack } from "office-ui-fabric-react";
import { PrimaryButton } from "office-ui-fabric-react/lib/components/Button/PrimaryButton/PrimaryButton";
import { MessageBar } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar";
import { MessageBarType } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar.types";
import * as React from "react";
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";
import StorageService from "../services/StorageService";
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
  notification: INotificationProps
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
      }
    };

    this.addWord = this.addWord.bind(this);
    this.setNotification = this.setNotification.bind(this);
    this.saveMemory = this.saveMemory.bind(this);
    this.load = this.load.bind(this);
  }

  addWord(word: ITranslationMemoryItem) {
    this.setState({
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

  saveMemory() {
    StorageService.saveTranslationMemory(this.state.memory).then((_) => {
      this.setNotification('Mentés sikeres.', MessageBarType.success);
    }).catch(err => {
      console.log(err);
      this.setNotification('Hiba történt', MessageBarType.error);
    });
  }

  load() {
    StorageService.loadTranslationMemory().then((mem) =>{
      this.setState({
        memory: mem,
        notification: {
          message: 'Betöltés sikeres',
          messageBarType: MessageBarType.success
        }
      });
    });
  }

  componentDidMount() {
    this.setState({
      memory: [
        {
          en: "example",
          hu: "példa",
          note: "Ez egy példa kifejezés"
        }
      ]
    });
  }

  render() {
    return (
      <div>
        <div className="ms-Grid">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-smOffset2 ms-sm8">
              <NewItem addWord={this.addWord}></NewItem>
            </div>
          </div>
          <div className="ms-Grid-row">
            <div className="ms-Grid-col">
              <TranslationMemory items={this.state.memory}></TranslationMemory>
            </div>
          </div>
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-smOffset1 ms-sm4">
              <PrimaryButton
                data-automation-id='save'
                text='Mentés'
                onClick={ this.saveMemory } />
            </div>
            <div className="ms-Grid-col ms-smOffset1 ms-sm4">
              <PrimaryButton
                data-automation-id='load'
                text='Betöltés'
                onClick={ this.load } />
            </div>
          </div>
        </div>
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
