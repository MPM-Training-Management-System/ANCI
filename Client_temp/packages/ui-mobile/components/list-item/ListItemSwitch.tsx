import {
  Switch,
} from "react-native";

interface Props{

  value:boolean;

  onValueChange(
    value:boolean
  ):void;

}

export function ListItemSwitch({

  value,

  onValueChange,

}:Props){

  return(

    <Switch

      value={value}

      onValueChange={
        onValueChange
      }

    />

  );

}