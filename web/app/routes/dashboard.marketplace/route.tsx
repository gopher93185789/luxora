import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { Refresh, VerifyToken } from "~/pkg/api/auth";
import { GetTokenFromLocalStorage } from "~/pkg/helpers/tokenHandling";

export default function Listings() {
  const navigate = useNavigate();
  useEffect(() => {
    const handle = async () => {
      try {
        const ok = await VerifyToken();
        if (ok === 200) return;

        const rt = await Refresh();
        if (rt !== 200) throw new Error("Failed to refresh");

        const tk = GetTokenFromLocalStorage();
        await fetch("/auth/cookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tk }),
        });
      } catch {
        navigate("/auth");
      }
    };
    handle();
  });

  return <>
  <p>nigger</p>
  </>
}