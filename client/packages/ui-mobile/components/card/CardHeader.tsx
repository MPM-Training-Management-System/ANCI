import type { ReactNode } from "react";
import { View } from "react-native";

import { styles } from "./Card.styles";

interface Props{
  children:ReactNode;
}

export function CardHeader({
  children,
}:Props){

  return(
    <View style={styles.header}>
      {children}
    </View>
  );

}