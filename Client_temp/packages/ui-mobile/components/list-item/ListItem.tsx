import {
  Pressable,
  View,
} from "react-native";

import {
  Body,
  Caption,
  H3,
} from "../typography";

import { styles } from "./ListItem.styles";

import type { ListItemProps } from "./ListItem.types";

export function ListItem({

  title,

  subtitle,

  description,

  left,

  right,

  disabled,

  style,

  ...props

}:ListItemProps){

  return(

    <Pressable

      {...props}

      disabled={disabled}

      style={[

        styles.container,

        disabled && styles.disabled,

        style,

      ]}

    >

      {left && (

        <View style={styles.left}>

          {left}

        </View>

      )}

      <View style={styles.content}>

        <H3>

          {title}

        </H3>

        {subtitle && (

          <Body>

            {subtitle}

          </Body>

        )}

        {description && (

          <Caption>

            {description}

          </Caption>

        )}

      </View>

      {right && (

        <View style={styles.right}>

          {right}

        </View>

      )}

    </Pressable>

  );

}