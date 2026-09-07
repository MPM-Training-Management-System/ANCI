import type { HTMLAttributes } from "react";

export interface PaginationProps
  extends HTMLAttributes<HTMLDivElement> {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;

  onPageChange: (page: number) => void;
}