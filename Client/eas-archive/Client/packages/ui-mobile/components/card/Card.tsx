import { Pressable } from "react-native";

import { styles } from "./Card.styles";
import type { CardProps } from "./Card.types";

export function Card({

  children,

  elevated=true,

  outlined=false,

  style,

  ...props

}:CardProps){

  return(

    <Pressable

      {...props}

      style={[

        styles.card,

        elevated && styles.elevated,

        outlined && styles.outlined,

        style,

      ]}

    >

      {children}

    </Pressable>

  );

}