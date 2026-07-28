import { Typography } from "./Typography";
import type { TypographyProps } from "./Typography.types";

export function Code(props: TypographyProps) {
  return (
    <Typography
      variant="codeTable"
      {...props}
    />
  );
}