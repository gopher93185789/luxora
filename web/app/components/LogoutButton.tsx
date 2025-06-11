import React from "react";
import { Link } from "@remix-run/react";

interface LogoutButtonProps {
  href: string;
  icon?: React.ReactElement;
  children?: React.ReactNode
}

export function LogoutButton({ href, icon }: LogoutButtonProps) {
  return (
    <Link
      to={href}
      className="w-full font-thin items-center border hover:bg-white/15 justify-center border-border/10 flex flex-row gap-2 hover:cursor-pointer duration-200 text-text-primary  rounded p-2"
    >
      {icon}
      
    </Link>
  );
}
