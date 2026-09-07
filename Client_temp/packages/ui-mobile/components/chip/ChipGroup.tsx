import { View } from "react-native";

import { Chip } from "./Chip";

interface ChipItem{

  label:string;

}

interface ChipGroupProps{

  items:ChipItem[];

  selected:string;

  onSelect(
    label:string
  ):void;

}

export function ChipGroup({

  items,

  selected,

  onSelect,

}:ChipGroupProps){

  return(

    <View
      style={{
        flexDirection:"row",
        flexWrap:"wrap",
        gap:8,
      }}
    >

      {items.map(item=>(

        <Chip

          key={item.label}

          label={item.label}

          selected={
            selected===item.label
          }

          onPress={()=>
            onSelect(item.label)
          }

        />

      ))}

    </View>

  );

}