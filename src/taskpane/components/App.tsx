import * as React from "react";
// images references in the manifest
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";
import Header from "./Header";
import TranslationMemory, { ITranslationMemoryItem } from "./TranslationMemory";
/* global Button Header, HeroList, HeroListItem, Progress, Word */

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export interface AppState {
  memoryItems: ITranslationMemoryItem[]
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      memoryItems: []
    };
  }

  componentDidMount() {
    this.setState({
      memoryItems: [
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
      <div className="ms-welcome">
      <Header message="Wrap me a burrito" title="Burrito Translate" logo="assets/logo-filled.png"></Header>
      <TranslationMemory items={this.state.memoryItems} ></TranslationMemory>
      </div>
    );
  }
}
