import React from "react";
import { Logout } from "~/pkg/api/auth";

interface LogoutButtonProps {
  icon?: React.ReactElement;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LogoutButton({ icon, children, className, onClick }: LogoutButtonProps) {
  const handleLogout = async () => {
    await Logout();
    onClick?.();
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className={className}
    >
      {icon}
      {children}
    </button>
  );
}
