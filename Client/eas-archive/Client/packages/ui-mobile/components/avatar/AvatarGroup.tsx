import { View } from "react-native";

import { Avatar } from "./Avatar";

import type { AvatarProps } from "./Avatar.types";

interface AvatarGroupProps{

  users:AvatarProps[];

}

export function AvatarGroup({

  users,

}:AvatarGroupProps){

  return(

    <View
      style={{
        flexDirection:"row",
      }}
    >

      {users.map((user,index)=>(

        <Avatar

          key={index}

          {...user}

          style={{
            marginLeft:index===0?0:-12,
          }}

        />

      ))}

    </View>

  );

}