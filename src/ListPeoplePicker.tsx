import {
  getTheme,
  IPeoplePickerItemSelectedProps,
  ListPeoplePicker,
  mergeStyles,
  PeoplePickerItemBase,
  PeoplePickerItemSuggestion,
  PersonaPresence,
  Text,
  IRawStyle,
  IPersonaProps,
  IBasePickerSuggestionsProps
} from "@fluentui/react";
import * as React from "react";
import { data } from "./data";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided
} from "react-beautiful-dnd";

const theme = getTheme();

export const wrapperClassName = mergeStyles({
  padding: theme.spacing.s1
});

const suggestionProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: "Proponowane elementy",
  mostRecentlyUsedHeaderText: "Proponowane elementy",
  noResultsFoundText: "Nie znaleziono dopasowań",
  loadingText: "Laduję się",
  showRemoveButtons: true,
  suggestionsAvailableAlertText: "Picker Suggestions available",
  suggestionsContainerAriaLabel: "Proponowane elementy"
};

const stylesForStackItem = (snapshot) => {
  const rootStyle: IRawStyle = {
    background: snapshot.isDragging ? "#addaed" : "#ffffff", //white
    width: 300, //must be equal to persona width
    border: "0.5px solid black",
    display: "flex",
    height: 35,
    overflow: "auto",
    paddingInlineEnd: "0.5em",
    marginTop: "1em",
    marginLeft: "1em",
    alignItems: "center",
    selectors: {
      ":hover": {
        background: "#ffffff",
        border: "0.5px solid #f3f2f1",
        cursor: "grab"
      },
      ":focus": {
        outline: "none"
      },
      ":active": {
        border: "0.5px solid black",
        outline: "none"
      }
    }
  };
  return { root: rootStyle };
};

export const ItemPicker: React.FunctionComponent = () => {
  const options: (IPersonaProps & {
    key: number;
  })[] = data.map((item) => ({
    key: item.id,
    imageUrl: "",
    imageInitials: item.type,
    text: item.name,
    secondaryText: item.type,
    tertiaryText: "",
    optionalText: "",
    isValid: true,
    presence: PersonaPresence.online
  }));

  const [currentSelectedItems, setCurrentSelectedItems] = React.useState<
    (IPersonaProps & { key: number })[]
  >([]);
  const [delayResults, setDelayResults] = React.useState(false);
  const [isPickerDisabled, setIsPickerDisabled] = React.useState(false);
  const [peopleList] = React.useState<(IPersonaProps & { key: number })[]>(
    options
  );

  const picker = React.useRef(null);

  const onFilterChanged = (
    filterText: string,
    currentPersonas: IPersonaProps[] | undefined,
    limitResults?: number
  ): IPersonaProps[] | Promise<IPersonaProps[]> => {
    if (filterText) {
      let filteredPersonas: IPersonaProps[] = filterPersonasByText(filterText);

      filteredPersonas = currentPersonas
        ? removeDuplicates(filteredPersonas, currentPersonas)
        : [];
      filteredPersonas = limitResults
        ? filteredPersonas.slice(0, limitResults)
        : filteredPersonas;
      return filterPromise(filteredPersonas);
    } else {
      return [];
    }
  };

  const filterPersonasByText = (filterText: string): IPersonaProps[] => {
    return peopleList.filter((item) =>
      doesTextStartWith(item.text as string, filterText)
    );
  };

  const filterPromise = (
    personasToReturn: IPersonaProps[]
  ): IPersonaProps[] | Promise<IPersonaProps[]> => {
    if (delayResults) {
      return convertResultsToPromise(personasToReturn);
    } else {
      return personasToReturn;
    }
  };

  const onItemsChange = (items: IPersonaProps[] | undefined): void => {
    items ? setCurrentSelectedItems(items) : setCurrentSelectedItems([]);
  };

  const controlledItems = [];
  for (let i = 0; i < 6; i++) {
    const item = peopleList[i];
    if (currentSelectedItems!.indexOf(item) === -1) {
      controlledItems.push(peopleList[i]);
    }
  }

  const onRenderSuggestionsItem = (
    personaProps: IPersonaProps,
    suggestionsProps: IBasePickerSuggestionsProps
  ) => (
    <PeoplePickerItemSuggestion
      personaProps={personaProps}
      suggestionsProps={suggestionsProps}
      styles={{ personaWrapper: { width: 300 } }}
    />
  );

  const reorder = (
    list: (IPersonaProps & { key: number })[],
    startIndex: number,
    endIndex: number
  ) => {
    const selectedCopy = [...list];
    const [removed] = selectedCopy.splice(startIndex, 1);
    selectedCopy.splice(endIndex, 0, removed);

    return selectedCopy;
  };

  function onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const selected = reorder(
      currentSelectedItems,
      result.source.index,
      result.destination.index
    );

    setCurrentSelectedItems(selected);
  }

  function getStyle(style, snapshot) {
    if (!snapshot.isDropAnimating) {
      return style;
    }
    return {
      ...style,
      // cannot be 0, but make it super tiny
      transitionDuration: `0.001s`
    };
  }

  const renderPicked = (props: IPeoplePickerItemSelectedProps) => {
    return (
      <Draggable
        key={props.item.key?.toString()}
        draggableId={props.item.key.toString()}
        index={props.index}
      >
        {(provided: DraggableProvided, snapshot) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            style={getStyle(provided.draggableProps.style, snapshot)}
          >
            <PeoplePickerItemBase
              {...props}
              styles={() => stylesForStackItem(snapshot)}
            />
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <>
      <fieldset style={{ border: 0 }}>
        <Text>Type "W" to pick items</Text>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <ListPeoplePicker
                  styles={{
                    root: {
                      width: "300px",
                      marginLeft: "10px",
                      overflow: "auto"
                    }
                  }}
                  onRenderSuggestionsItem={onRenderSuggestionsItem}
                  // eslint-disable-next-line react/jsx-no-bind
                  onResolveSuggestions={onFilterChanged}
                  pickerCalloutProps={{
                    calloutWidth: 300,
                    calloutMaxHeight: 150
                  }}
                  getTextFromItem={getTextFromItem}
                  pickerSuggestionsProps={suggestionProps}
                  key={"list"}
                  selectedItems={currentSelectedItems}
                  className={"ms-PeoplePicker"}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={onItemsChange}
                  onRenderItem={renderPicked}
                  componentRef={picker}
                  resolveDelay={300}
                  disabled={isPickerDisabled}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </fieldset>
    </>
  );
};

function doesTextStartWith(text: string, filterText: string): boolean {
  return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
}

function listContainsPersona(
  persona: IPersonaProps,
  personas: IPersonaProps[]
) {
  if (!personas || !personas.length || personas.length === 0) {
    return false;
  }
  return personas.filter((item) => item.text === persona.text).length > 0;
}

function removeDuplicates(
  personas: IPersonaProps[],
  possibleDupes: IPersonaProps[]
) {
  return personas.filter(
    (persona) => !listContainsPersona(persona, possibleDupes)
  );
}

function convertResultsToPromise(
  results: IPersonaProps[]
): Promise<IPersonaProps[]> {
  return new Promise<IPersonaProps[]>((resolve, reject) =>
    setTimeout(() => resolve(results), 2000)
  );
}

function getTextFromItem(persona: IPersonaProps): string {
  return persona.text as string;
}
