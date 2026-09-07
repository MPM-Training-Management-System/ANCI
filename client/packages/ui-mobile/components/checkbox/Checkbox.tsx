
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@repo/token";

import {
  Caption,
  Label,
} from "../typography";

import { styles } from "./Checkbox.styles";
import type { CheckboxProps } from "./Checkbox.types";

export function Checkbox({

  label,

  helperText,

  error,

  checked = false,

  disabled = false,

  containerStyle,

  checkboxStyle,

  onCheckedChange,

  ...props

}: CheckboxProps) {

  return (

    <View
      style={[
        styles.container,
        containerStyle,
      ]}
    >

      <Pressable

        {...props}

        disabled={disabled}

        style={styles.row}

        onPress={() =>
          onCheckedChange?.(!checked)
        }

      >

        <View

          style={[

            styles.checkbox,

            checked && styles.checked,

            disabled && styles.disabled,

            checkboxStyle,

          ]}

        >

          {checked && (

            <Ionicons
              name="checkmark"
              size={16}
              color={colors.onPrimary}
            />

          )}

        </View>

        {label && (

          <Label
            style={styles.label}
          >
            {label}
          </Label>

        )}

      </Pressable>

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

