import {
  Image,
  View,
} from "react-native";

import { Body } from "../typography";

import { styles } from "./Avatar.styles";

import type { AvatarProps } from "./Avatar.types";

export function Avatar({

  source,

  name,

  size="md",

  style,

}:AvatarProps){

  const initials=name
    ?.split(" ")
    .map(x=>x[0])
    .join("")
    .substring(0,2)
    .toUpperCase();

  return(

    <View
      style={[
        styles.avatar,
        styles[size],
        style,
      ]}
    >

      {source ? (

        <Image
          source={source}
          style={styles.image}
        />

      ) : (

        <Body>

          {initials ?? "?"}

        </Body>

      )}

    </View>

  );

}