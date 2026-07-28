import { useState } from "react";

import {
  TextInput,
  View,
} from "react-native";

import {
  Body,
  Caption,
  Label,
} from "../typography";

import { styles } from "./Input.styles";
import type { InputProps } from "./Input.types";

export function Input({

  label,

  helperText,

  error,

  leftIcon,

  rightIcon,

  editable = true,

  containerStyle,

  inputStyle,

  ...props

}:InputProps){

  const [focused,setFocused]=useState(false);

  return(

    <View
      style={[
        styles.container,
        containerStyle,
      ]}
    >

      {label && (

        <Label
          style={styles.label}
        >
          {label}
        </Label>

      )}

      <View
        style={[

          styles.inputContainer,

          focused && styles.focused,

          !editable && styles.disabled,

        ]}
      >

        {leftIcon}

        <TextInput

          {...props}

          editable={editable}

          style={[
            styles.input,
            inputStyle,
          ]}

          placeholderTextColor="#999"

          onFocus={()=>
            setFocused(true)
          }

          onBlur={()=>
            setFocused(false)
          }

        />

        {rightIcon}

      </View>

      {error ? (

        <Caption
          style={styles.error}
        >
          {error}
        </Caption>

      ) : helperText ? (

        <Caption
          style={styles.helper}
        >
          {helperText}
        </Caption>

      ) : null}

    </View>

  );

}