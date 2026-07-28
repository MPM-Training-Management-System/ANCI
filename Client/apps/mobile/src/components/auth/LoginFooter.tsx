import { Pressable } from "react-native";

import {
  Body,
  Caption,
  HStack,
  Label,
  VStack,
} from "@repo/ui-mobile";

interface LoginFooterProps {
  onRegister: () => void;
}

export default function LoginFooter({
  onRegister,
}: LoginFooterProps) {
  return (
    <VStack
      align="center"
      spacing={16}
    >
      <Caption
        style={{
          textAlign: "center",
        }}
      >
        Securely managed by{"\n"}
        ACE NextGen Consultancy Inc.
      </Caption>

      <HStack
        align="center"
        justify="center"
        spacing={8}
      >
        <Pressable>
          <Body>Help Center</Body>
        </Pressable>

        <Body>•</Body>

        <Pressable onPress={onRegister}>
          <Label>Create Account</Label>
        </Pressable>

        <Body>•</Body>

        <Pressable>
          <Body>Security Policy</Body>
        </Pressable>
      </HStack>
    </VStack>
  );
}