import {
  Input,
} from "./Input";

import type {
  InputProps,
} from "./Input.types";

export function TextArea(
  props:InputProps
){

  return(

    <Input

      {...props}

      multiline

      textAlignVertical="top"

      style={{
        minHeight:120,
      }}

    />

  );

}