import { Typography } from "./Typography";
import type { TypographyProps } from "./Typography.types";

export function H1(props: TypographyProps) {
  return (
    <Typography
      variant="displayLg"
      {...props}
    />
  );
}