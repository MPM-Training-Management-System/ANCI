import type { ReactNode } from "react";

export interface SelectOption<T = string> {
  /**
   * Display text
   */
  label: string;

  /**
   * Actual value
   */
  value: T;

  /**
   * Disable this option
   */
  disabled?: boolean;

  /**
   * Optional icon shown on the left
   */
  leftIcon?: ReactNode;

  /**
   * Optional subtitle/description
   */
  description?: string;
}

export interface SelectProps<T = string> {
  /**
   * Selected value
   */
  value?: T;

  /**
   * Options
   */
  items: SelectOption<T>[];

  /**
   * Value change callback
   */
  onValueChange?: (value: T) => void;

  /**
   * Floating label
   */
  label?: string;

  /**
   * Placeholder
   */
  placeholder?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Disable the whole component
   */
  disabled?: boolean;

  /**
   * Required indicator
   */
  required?: boolean;

  /**
   * Enable searching
   */
  searchable?: boolean;

  /**
   * Search placeholder
   */
  searchPlaceholder?: string;

  /**
   * Modal title
   */
  modalTitle?: string;

  /**
   * Left icon inside trigger
   */
  leftIcon?: ReactNode;

  /**
   * Right icon inside trigger
   */
  rightIcon?: ReactNode;

  /**
   * Empty state text
   */
  emptyMessage?: string;
}