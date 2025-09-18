"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface LoginWithLineProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "icon-only";
  size?: "default" | "sm" | "lg";
}

/**
 * LINE Login Button component that adheres to the official LINE Developers Guidelines
 * Reference: https://terms2.line.me/LINE_Developers_Guidelines_for_Login_Button
 *
 * Key compliance features:
 * - Uses official LINE icon from /public/line.png
 * - Maintains proper aspect ratio and padding as specified
 * - Includes isolation zone around the button
 * - Supports both full button and icon-only variants
 * - Follows LINE's color scheme requirements
 */
export const LoginWithLine: React.FC<LoginWithLineProps> = ({
  onClick,
  disabled = false,
  className,
  variant = "default",
  size = "default",
}) => {
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const iconSizes = {
    sm: { width: 16, height: 16 },
    default: { width: 20, height: 20 },
    lg: { width: 24, height: 24 },
  };

  const baseClasses = cn(
    // Base button styling with official LINE colors
    "inline-flex items-center justify-center gap-2",
    "font-medium transition-all duration-200",
    "border-0 rounded-lg",
    // Official LINE colors: #06C755 (primary green) with proper hover state
    "bg-[#06C755] hover:bg-[#05B04D]",
    "text-white",
    "shadow-sm hover:shadow-md",
    "focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#06C755] disabled:hover:shadow-sm",
    // Isolation zone compliance - margin ensures proper spacing
    "mx-2 my-1",
    sizeClasses[size],
    className,
  );

  const iconSize = iconSizes[size];

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={baseClasses}
        aria-label={variant === "icon-only" ? "Sign in with LINE" : undefined}
      >
        {/* LINE Icon - maintains aspect ratio as per guidelines */}
        <Image
          src="/line.png"
          alt="LINE"
          width={iconSize.width}
          height={iconSize.height}
          className="shrink-0"
          priority
        />

        {/* Login Button Text - only shown in default variant */}
        {variant === "default" && (
          <span className="whitespace-nowrap">Sign in with LINE</span>
        )}
      </button>
    </div>
  );
};

/**
 * Alternative compact version for use in forms or tight spaces
 * Maintains LINE guidelines while providing a more compact option
 */
export const LoginWithLineCompact: React.FC<
  Omit<LoginWithLineProps, "variant">
> = (props) => {
  return <LoginWithLine {...props} variant="icon-only" size="sm" />;
};

/**
 * Large version for prominent placement (e.g., main login page)
 * Maintains LINE guidelines with enhanced visibility
 */
export const LoginWithLineLarge: React.FC<
  Omit<LoginWithLineProps, "variant" | "size">
> = (props) => {
  return <LoginWithLine {...props} variant="default" size="lg" />;
};

export default LoginWithLine;
