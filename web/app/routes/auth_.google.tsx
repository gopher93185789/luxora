import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import ShinyText from "~/components/ShinyText";
import { OauthExchange } from "~/pkg/api/auth";
import { GetTokenFromLocalStorage } from "~/pkg/helpers/tokenHandling";

export default function GoogleHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const handler = async () => {
      try {
        if (!code || code === "") throw new Error("missing code url param");
        if (!state || state === "") throw new Error("missing state url param");

        const resp = await OauthExchange(code, state, "google");
        if (resp?.code) throw new Error("unable to log you in");

        const tk = GetTokenFromLocalStorage();
        await fetch("/auth/cookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tk }),
        });

        navigate("/dashboard");
      } catch {
        navigate("/auth");
      }
    };

    handler();
  }, []);

  return (
    <div className="h-screen w-full  flex items-center justify-center">
      <ShinyText className="text-2xl" text="Logging you in" speed={1} />
    </div>
  );
}
