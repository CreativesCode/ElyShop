"use client";

import * as React from "react";

import { Icons } from "@/components/layouts/icons";
import { Button } from "@/components/ui/button";
import { type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    return (
      <div className="relative flex items-center border border-input rounded-md bg-background">
        <Icons.lock className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          {...props}
          ref={ref}
          className={cn(
            "w-full h-10 pl-10 pr-10 py-2 text-sm rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground",
            className,
          )}
          type={showPassword ? "text" : "password"}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={props.value === "" || props.disabled}
        >
          {showPassword ? (
            <Icons.hide
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          ) : (
            <Icons.view
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
