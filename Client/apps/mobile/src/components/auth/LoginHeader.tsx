import {
  Body,
  H1,
  VStack,
} from "@repo/ui-mobile";

export function LoginHeader() {
  return (
    <VStack
      align="center"
      spacing={8}
    >
      <H1
        style={{
          color: "#001736",
        }}
      >
        ISTMS
      </H1>

      <Body
        style={{
          opacity: 0.7,
        }}
      >
        Training Management System
      </Body>
    </VStack>
  );
}