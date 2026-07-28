import { Typography } from "./Typography";
import type { TypographyProps } from "./Typography.types";

export function H3(props: TypographyProps) {
  return (
    <Typography
      variant="titleSm"
      {...props}
    />
  );
}