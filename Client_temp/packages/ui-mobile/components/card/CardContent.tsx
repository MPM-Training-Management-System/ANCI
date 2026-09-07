import type { ReactNode } from "react";
import { View } from "react-native";

import { styles } from "./Card.styles";

interface Props{
  children:ReactNode;
}

export function CardContent({
  children,
}:Props){

  return(
    <View style={styles.content}>
      {children}
    </View>
  );

}