import { IStackProps, Stack } from "office-ui-fabric-react";
import { PrimaryButton } from "office-ui-fabric-react/lib/components/Button/PrimaryButton/PrimaryButton";
import { MessageBar } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar";
import { MessageBarType } from "office-ui-fabric-react/lib/components/MessageBar/MessageBar.types";
import * as React from "react";
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";
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
  notification: string
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
      notification: ''
    };

    this.addWord = this.addWord.bind(this);
    this.setNotification = this.setNotification.bind(this);
    this.saveMemory = this.saveMemory.bind(this);
  }

  addWord(word: ITranslationMemoryItem) {
    this.setState({
      memory: [ ...this.state.memory, word ]
    });
  }

  setNotification(message: string) {
    this.setState({
      notification: message
    });
  }

  saveMemory() {
    this.setNotification("Memory Saved");
  }

  componentDidMount() {
    this.setState({
      memory: [
        {
          en: "Calculator",
          hu: "Számológép",
          note: "Ritkán használt"
        },
        {
          en: "Kitty",
          hu: "Kismacska",
          note: "Csak ha szükség van rá"
        },
        {
          en: "Strange",
          hu: "Különös, furcsa"
        },
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
            <div className="ms-Grid-col ms-smOffset2 ms-sm8">
              <TranslationMemory items={this.state.memory}></TranslationMemory>
            </div>
          </div>
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-smOffset4 ms-sm5">
              <PrimaryButton
                data-automation-id='save'
                text='Save memory'
                onClick={ this.saveMemory } />
            </div>
          </div>
        </div>
        <Stack {...verticalStackProps}>
            {(!!this.state.notification) && <MessageBar
              messageBarType={MessageBarType.success}
              isMultiline={false}
              onDismiss={() => this.setNotification(undefined)}
              dismissButtonAriaLabel="Close"
              >
              {this.state.notification}
            </MessageBar>}
        </Stack>
      </div>
    );
  }
}
