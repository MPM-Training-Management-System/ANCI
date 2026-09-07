export interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;

  placeholder?: string;

  disabled?: boolean;
}