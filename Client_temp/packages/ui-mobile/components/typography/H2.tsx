import { Typography } from "./Typography";
import type { TypographyProps } from "./Typography.types";

export function H2(props: TypographyProps) {
  return (
    <Typography
      variant="headlineMd"
      {...props}
    />
  );
}