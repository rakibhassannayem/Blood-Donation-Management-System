import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  footer?: React.ReactNode;
}

export default function Card({
  children,
  className = "",
  onClick,
  hoverEffect = true,
  footer,
}: CardProps) {
  return (
    <div
      className={`bg-white overflow-hidden shadow rounded-lg ${
        hoverEffect ? "transition-all duration-300 hover:shadow-lg" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && <div className="bg-gray-50 px-4 py-4 sm:px-6">{footer}</div>}
    </div>
  );
}
