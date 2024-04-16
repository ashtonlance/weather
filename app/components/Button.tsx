import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type: "button" | "submit" | "reset";
  extraClasses?: string;
  disabled?: boolean;
  name?: string;
}

export default function Button({
  children,
  onClick,
  type,
  extraClasses,
  disabled,
  name = "",
}: ButtonProps) {
  return (
    <button
      name={name}
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center whitespace-nowrap rounded-[6px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${extraClasses}`}
    >
      {children}
    </button>
  );
}
