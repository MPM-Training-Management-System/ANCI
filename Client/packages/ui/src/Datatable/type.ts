import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";

export interface DataTableActionButton {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

export interface DataTableProps<TData> {
  title?: string;
  description?: string;

  columns: ColumnDef<TData, unknown>[];
  data: TData[];

  loading?: boolean;

  searchable?: boolean;
  searchPlaceholder?: string;

  showPagination?: boolean;

  addButton?: DataTableActionButton;

  toolbar?: ReactNode;

  emptyTitle?: string;
  emptyDescription?: string;
}