"use client";

import * as React from "react";
import { inputStyles } from "@repo/token";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: keyof typeof inputStyles.states;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ state, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          inputStyles.base,
          state ? inputStyles.states[state] : "",
          className,
        ].join(" ")}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";