import "./styles.css";
import * as React from "react";
import { DefaultButton } from "@fluentui/react";
import { Panel } from "@fluentui/react";
import { ItemPicker } from "./ListPeoplePicker";
import { initializeIcons } from "@fluentui/react/lib/Icons";
//import { registerIcons } from '@fluentui/react/lib/Styling';

initializeIcons(undefined, { disableWarnings: true });

export const PanelExample: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <br />
      <br />
      <DefaultButton text="Open panel" onClick={() => setIsOpen(true)} />
      <Panel
        headerText="Non-modal panel"
        // this prop makes the panel non-modal
        isBlocking={false}
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        closeButtonAriaLabel="Close"
      >
        <ItemPicker />
      </Panel>
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <PanelExample />
    </div>
  );
}
