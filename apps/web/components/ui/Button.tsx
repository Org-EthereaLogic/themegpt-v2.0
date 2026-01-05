"use client";

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { useRipple, RippleContainer } from "./ButtonRipple";

type ButtonVariant = "primary" | "secondary" | "outline" | "teal" | "brown";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  withRipple?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-5 w-5 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: "button";
    href?: never;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    as: "a";
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, { base: string; style: React.CSSProperties; activeStyle?: React.CSSProperties }> = {
  primary: {
    base: "inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0",
    style: {
      background: "#E8A87C",
      boxShadow: "0 8px 24px rgba(232, 168, 124, 0.35)",
    },
  },
  secondary: {
    base: "inline-flex items-center justify-center rounded-full border-2 px-6 py-3.5 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
    style: {
      borderColor: "#4A3728",
      color: "#4A3728",
    },
  },
  outline: {
    base: "inline-flex items-center justify-center rounded-full border-2 px-6 py-3 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
    style: {
      borderColor: "#4A3728",
      color: "#4A3728",
    },
  },
  teal: {
    base: "inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold text-white no-underline transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
    style: {
      background: "#5BB5A2",
      boxShadow: "0 4px 16px rgba(91, 181, 162, 0.25)",
    },
  },
  brown: {
    base: "inline-flex items-center justify-center w-full py-3.5 rounded-[14px] font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
    style: {
      background: "#4A3728",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    },
  },
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const { variant = "primary", withRipple = false, isLoading = false, loadingText, children, className = "", ...rest } = props;
    const { ripples, createRipple } = useRipple();

    const { base, style } = variantStyles[variant];
    const combinedClassName = `${base} ${withRipple ? "relative overflow-hidden" : ""} ${className}`.trim();

    // Content to render inside button
    const buttonContent = isLoading ? (
      <>
        <Spinner />
        <span>{loadingText || children}</span>
      </>
    ) : (
      children
    );

    if (props.as === "a") {
      const { as: _, ...anchorProps } = rest as ButtonAsLink;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={combinedClassName}
          style={style}
          onClick={withRipple ? createRipple : undefined}
          aria-busy={isLoading}
          {...anchorProps}
        >
          {withRipple && <RippleContainer ripples={ripples} />}
          {buttonContent}
        </a>
      );
    }

    const { as: _, disabled, ...buttonProps } = rest as ButtonAsButton;
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        style={style}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        onClick={(e) => {
          if (isLoading) return;
          if (withRipple) createRipple(e);
          (buttonProps as ButtonAsButton).onClick?.(e);
        }}
        {...buttonProps}
      >
        {withRipple && <RippleContainer ripples={ripples} />}
        {buttonContent}
      </button>
    );
  }
);

export type { ButtonProps, ButtonVariant };
