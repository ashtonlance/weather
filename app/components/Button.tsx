import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type: "button" | "submit" | "reset";
  extraClasses?: string;
}

export default function Button({
  children,
  onClick,
  type,
  extraClasses,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center whitespace-nowrap rounded-[6px] px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 ${extraClasses}`}
    >
      {children}
    </button>
  );
}
