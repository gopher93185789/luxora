import { Link, useNavigate } from "@remix-run/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { OauthButton } from "~/components/oauthButton";
import { useEffect } from "react";
import { VerifyToken } from "~/pkg/api/auth";

export default function Auth() {
  const navigate = useNavigate();
  useEffect(() => {
    const handle = async () => {
      const resp = await VerifyToken();
      if (resp === 200) navigate("/marketplace");

    };
    handle();
  }, []);

  return (
    <>
      <div className="w-full h-screen  overflow-hidden flex items-center justify-center">
        <div className="w-100  flex flex-col gap-3 items-center justify-center">
          <OauthButton
            icon={<FaGithub />}
            href="https://api.luxoras.nl/auth/github"
          >
            Login with GitHub
          </OauthButton>
          <OauthButton
            icon={<FcGoogle />}
            href="https://api.luxoras.nl/auth/google"
          >
            Login with Google
          </OauthButton>
          <Link
            to={"/"}
            className="text-text-primary/50 hover:text-text-primary duration-300 "
          >
            Go back home
          </Link>
        </div>
      </div>
    </>
  );
}
