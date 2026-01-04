"use client";

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { useRipple, RippleContainer } from "./ButtonRipple";

type ButtonVariant = "primary" | "secondary" | "outline" | "teal" | "brown";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  withRipple?: boolean;
  children: React.ReactNode;
  className?: string;
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

const variantStyles: Record<ButtonVariant, { base: string; style: React.CSSProperties }> = {
  primary: {
    base: "inline-flex items-center gap-2.5 rounded-full px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]",
    style: {
      background: "#E8A87C",
      boxShadow: "0 8px 24px rgba(232, 168, 124, 0.35)",
    },
  },
  secondary: {
    base: "inline-flex items-center rounded-full border-2 px-6 py-3.5 font-semibold transition-all duration-300 hover:-translate-y-0.5",
    style: {
      borderColor: "#4A3728",
      color: "#4A3728",
    },
  },
  outline: {
    base: "inline-flex items-center rounded-full border-2 px-6 py-3 font-semibold transition-all duration-300 hover:-translate-y-0.5",
    style: {
      borderColor: "#4A3728",
      color: "#4A3728",
    },
  },
  teal: {
    base: "rounded-full px-6 py-3 font-semibold text-white no-underline transition-all duration-300 hover:-translate-y-0.5",
    style: {
      background: "#5BB5A2",
      boxShadow: "0 4px 16px rgba(91, 181, 162, 0.25)",
    },
  },
  brown: {
    base: "w-full py-3.5 rounded-[14px] font-semibold text-white transition-all duration-300 hover:scale-[1.02]",
    style: {
      background: "#4A3728",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    },
  },
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const { variant = "primary", withRipple = false, children, className = "", ...rest } = props;
    const { ripples, createRipple } = useRipple();

    const { base, style } = variantStyles[variant];
    const combinedClassName = `${base} ${withRipple ? "relative overflow-hidden" : ""} ${className}`.trim();

    if (props.as === "a") {
      const { as: _, ...anchorProps } = rest as ButtonAsLink;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={combinedClassName}
          style={style}
          onClick={withRipple ? createRipple : undefined}
          {...anchorProps}
        >
          {withRipple && <RippleContainer ripples={ripples} />}
          {children}
        </a>
      );
    }

    const { as: _, ...buttonProps } = rest as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        style={style}
        onClick={(e) => {
          if (withRipple) createRipple(e);
          (buttonProps as ButtonAsButton).onClick?.(e);
        }}
        {...buttonProps}
      >
        {withRipple && <RippleContainer ripples={ripples} />}
        {children}
      </button>
    );
  }
);

export type { ButtonProps, ButtonVariant };
