export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: "select" | "date";

  value?: string | Date;

  options?: FilterOption[];
}

export interface FilterDropdownProps {
  title?: string;

  fields: FilterField[];

  onChange: (
    key: string,
    value: string | Date | undefined
  ) => void;

  onApply?: () => void;

  onReset?: () => void;
}