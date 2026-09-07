import { Typography } from "./Typography";
import type { TypographyProps } from "./Typography.types";

export function Title(props: TypographyProps) {
  return (
    <Typography
      variant="titleSm"
      {...props}
    />
  );
}