import { Link } from "@remix-run/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { OauthButton } from "~/components/oauthButton";


export default function Auth() {
  return (
    <>
      <div className="w-full h-screen bg-primary overflow-hidden flex items-center justify-center">
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
