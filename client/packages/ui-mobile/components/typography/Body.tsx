import { Typography } from "./Typography";
import type { TypographyProps } from "./Typography.types";

export function Body(props: TypographyProps) {
  return (
    <Typography
      variant="bodyMd"
      {...props}
    />
  );
}