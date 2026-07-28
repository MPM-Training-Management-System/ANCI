import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Input,
} from "./Input";

import type {
  InputProps,
} from "./Input.types";

export function SearchInput(
  props:InputProps
){

  return(

    <Input

      {...props}

      placeholder="Search..."

      leftIcon={

        <Ionicons

          name="search"

          size={20}

          color="#777"

        />

      }

    />

  );

}