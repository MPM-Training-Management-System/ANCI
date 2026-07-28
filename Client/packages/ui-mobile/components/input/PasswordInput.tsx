import { useState } from "react";

import {
  Pressable,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Input,
} from "./Input";

import type {
  InputProps,
} from "./Input.types";

export function PasswordInput(
  props:InputProps
){

  const [
    secure,
    setSecure,
  ]=useState(true);

  return(

    <Input

      {...props}

      secureTextEntry={secure}

      rightIcon={

        <Pressable
          onPress={()=>
            setSecure(!secure)
          }
        >

          <Ionicons

            size={22}

            color="#777"

            name={
              secure
              ? "eye-off-outline"
              : "eye-outline"
            }

          />

        </Pressable>

      }

    />

  );

}