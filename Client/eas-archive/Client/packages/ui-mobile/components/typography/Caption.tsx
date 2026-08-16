import { Typography } from "./Typography";
import type { TypographyProps } from "./Typography.types";

export function Caption(props: TypographyProps) {
  return (
    <Typography
      variant="bodySm"
      {...props}
    />
  );
}