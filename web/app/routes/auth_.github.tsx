import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { OauthExchange } from "~/pkg/api/oauthExchange";
import { SetTokenInLocalStorage } from "~/pkg/helpers/tokenHandling";

export default function GithubHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const handler = async () => {
      try {
        if (!code || code === "") throw new Error("missing code url param");
        if (!state || state === "") throw new Error("missing state url param");

        const resp = await OauthExchange(code, state, "github")
        if ("code" in resp) throw new Error("unable to log you in");

        SetTokenInLocalStorage(resp.access_token)

        navigate("/marketplace")
        
      } catch {
        navigate("/");
      }
    };

    handler()
  }, []);

  return (
    <div className="h-screen w-full bg-primary flex items-center justify-center"></div>
  );
}
