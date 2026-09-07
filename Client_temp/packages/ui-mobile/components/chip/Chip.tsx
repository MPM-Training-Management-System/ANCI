import { Pressable } from "react-native";

import { Caption } from "../typography";

import { styles } from "./Chip.styles";
import type { ChipProps } from "./Chip.types";

export function Chip({

  label,

  selected=false,

  leftIcon,

  rightIcon,

  style,

  ...props

}:ChipProps){

  return(

    <Pressable

      {...props}

      style={[

        styles.chip,

        selected && styles.selected,

        style,

      ]}

    >

      {leftIcon}

      <Caption
        style={[
          styles.text,
          selected &&
          styles.selectedText,
        ]}
      >
        {label}
      </Caption>

      {rightIcon}

    </Pressable>

  );

}