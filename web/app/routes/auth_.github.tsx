import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { OauthExchange } from "~/pkg/api/auth";

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

        const resp = await OauthExchange(code, state, "github");
        if (resp) throw new Error("unable to log you in");

        navigate("/marketplace");
      } catch (e){
        console.error(e)
        navigate("/");
      }
    };

    handler();
  }, []);

  return (
    <div className="h-screen w-full  flex items-center justify-center"></div>
  );
}
