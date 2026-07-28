
import { Pressable } from "react-native";

import {
  Body,
  Label,
} from "@repo/ui-mobile";

import { HStack } from "@repo/ui-mobile";

interface RegisterFooterProps {
  onLogin: () => void;
}

export default function RegisterFooter({
  onLogin,
}: RegisterFooterProps) {
  return (
    <HStack
    
      
    >
      <Body>
        Already have an account?
      </Body>

      <Pressable onPress={onLogin}>
        <Label>
          Sign In
        </Label>
      </Pressable>
    </HStack>
  );
}

