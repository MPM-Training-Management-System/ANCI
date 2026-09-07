import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

export interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export interface TableHeadProps
  extends ThHTMLAttributes<HTMLTableCellElement> {}

export interface TableCellProps
  extends TdHTMLAttributes<HTMLTableCellElement> {}

export interface TableRowProps
  extends HTMLAttributes<HTMLTableRowElement> {}