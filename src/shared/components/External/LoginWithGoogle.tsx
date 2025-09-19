import React from "react";
import { cn } from "@/shared/lib/utils";

interface LoginWithGoogleProps {
  onClick: () => void;
  theme?: "light" | "dark" | "neutral";
  size?: "small" | "medium" | "large";
  shape?: "rectangular" | "pill";
  text?: "signin" | "signup" | "continue";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="20"
    height="20"
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

export const LoginWithGoogle: React.FC<LoginWithGoogleProps> = ({
  onClick,
  theme = "light",
  size = "medium",
  shape = "rectangular",
  text = "signin",
  disabled = false,
  loading = false,
  className,
}) => {
  const getButtonText = () => {
    switch (text) {
      case "signup":
        return "Sign up with Google";
      case "continue":
        return "Continue with Google";
      default:
        return "Sign in with Google";
    }
  };

  const getThemeStyles = () => {
    switch (theme) {
      case "dark":
        return {
          background: "#131314",
          border: "1px solid #8E918F",
          color: "#E3E3E3",
          hoverBackground: "#1a1a1b",
        };
      case "neutral":
        return {
          background: "#F2F2F2",
          border: "none",
          color: "#1F1F1F",
          hoverBackground: "#e8e8e8",
        };
      default: // light
        return {
          background: "#FFFFFF",
          border: "1px solid #747775",
          color: "#1F1F1F",
          hoverBackground: "#f8f9fa",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          height: "32px",
          padding: "0 12px",
          fontSize: "12px",
          gap: "8px",
        };
      case "large":
        return {
          height: "48px",
          padding: "0 20px",
          fontSize: "16px",
          gap: "12px",
        };
      default: // medium
        return {
          height: "40px",
          padding: "0 16px",
          fontSize: "14px",
          gap: "10px",
        };
    }
  };

  const themeStyles = getThemeStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyles = {
    backgroundColor: themeStyles.background,
    border: themeStyles.border,
    color: themeStyles.color,
    height: sizeStyles.height,
    padding: sizeStyles.padding,
    fontSize: sizeStyles.fontSize,
    gap: sizeStyles.gap,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors duration-200",
        "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        shape === "pill" ? "rounded-full" : "rounded-md",
        "hover:shadow-sm active:scale-[0.98]",
        className,
      )}
      style={{
        ...buttonStyles,
        fontFamily:
          'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 500,
        lineHeight: "20px",
        minWidth: "fit-content",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = themeStyles.hoverBackground;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = themeStyles.background;
        }
      }}
      type="button"
      role="button"
      aria-label={getButtonText()}
    >
      {loading ? (
        <LoadingSpinner className="text-current" />
      ) : (
        <GoogleIcon className="flex-shrink-0" />
      )}
      <span className="select-none">{getButtonText()}</span>
    </button>
  );
};

export default LoginWithGoogle;
