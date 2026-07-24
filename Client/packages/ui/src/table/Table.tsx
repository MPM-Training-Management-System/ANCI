import { forwardRef } from "react";
import { cn } from "@repo/lib";

import {
  tableWrapperVariants,
  tableVariants,
  tableHeaderVariants,
  tableHeadVariants,
  tableRowVariants,
  tableCellVariants,
} from "./Table.styles";

import type {
  TableProps,
  TableHeadProps,
  TableCellProps,
  TableRowProps,
} from "./Table.types";

export const TableWrapper = ({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(tableWrapperVariants(), className)}>
    <div className="overflow-x-auto">
      {children}
    </div>
  </div>
);

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn(tableVariants(), className)}
      {...props}
    />
  )
);

Table.displayName = "Table";

export const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead
    className={cn(tableHeaderVariants(), className)}
    {...props}
  />
);

export const TableBody = (
  props: React.HTMLAttributes<HTMLTableSectionElement>
) => <tbody {...props} />;

export const TableRow = ({
  className,
  ...props
}: TableRowProps) => (
  <tr
    className={cn(tableRowVariants(), className)}
    {...props}
  />
);

export const TableHead = ({
  className,
  ...props
}: TableHeadProps) => (
  <th
    className={cn(tableHeadVariants(), className)}
    {...props}
  />
);

export const TableCell = ({
  className,
  ...props
}: TableCellProps) => (
  <td
    className={cn(tableCellVariants(), className)}
    {...props}
  />
);