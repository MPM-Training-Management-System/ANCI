import { Typography } from "./Typography";
import type { TypographyProps } from "./Typography.types";

export function Label(props: TypographyProps) {
  return (
    <Typography
      variant="labelCaps"
      {...props}
    />
  );
}