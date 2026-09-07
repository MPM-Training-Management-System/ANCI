import type { ReactNode } from "react";
import { View } from "react-native";

import { styles } from "./Card.styles";

interface Props{
  children:ReactNode;
}

export function CardFooter({
  children,
}:Props){

  return(
    <View style={styles.footer}>
      {children}
    </View>
  );

}