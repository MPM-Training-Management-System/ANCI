
import { Button } from "@repo/ui-mobile";

interface RegisterActionsProps {
  loading?: boolean;
  disabled?: boolean;
  onSubmit: () => void;
}

export default function RegisterActions({
  loading = false,
  disabled = false,
  onSubmit,
}: RegisterActionsProps) {
  return (
    <Button
     
          onPress={onSubmit}
          disabled={disabled || loading}
          loading={loading} children={undefined}
    />
  );
}

