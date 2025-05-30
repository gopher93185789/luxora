import React from "react";
import { Link } from "@remix-run/react";

interface OauthButtonProps {
  href: string;
  icon?: React.ReactElement;
  children?: React.ReactNode
}

export function OauthButton({ href, icon, children }: OauthButtonProps) {
  return (
    <Link
      to={href}
      className="w-full font-thin items-center border hover:bg-white/15 justify-center border-border/10 flex flex-row gap-2 hover:cursor-pointer duration-200 text-text-primary  rounded p-2"
    >
      {icon}
      {children && typeof children === "string" ? (
        <p className="text-text-primary font-medium">{children}</p>
      ) : (
        children
      )}
    </Link>
  );
}
