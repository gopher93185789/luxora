import { Link, useNavigate } from "@remix-run/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { OauthButton } from "~/components/oauthButton";
import { useEffect, useState } from "react";
import { VerifyToken } from "~/pkg/api/auth";
import { MetaFunction } from "@remix-run/cloudflare";


export const meta: MetaFunction = () => {
  return [
    { title: "luxora - auth" },
    {
      name: "description",
      content: "The marketplace for the rich by the rich",
    },
  ];
};

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    const handle = async () => {
      const resp = await VerifyToken();
      if (resp === 200) navigate("/dashboard");
      setIsLoading(false);
    };
    handle();
  }, []);

  return (
    <>
    
      <div className="w-full h-screen overflow-hidden flex items-center justify-center flex-col">
        
        <div className="mb-5">
          <img 
          src="/logo.png" 
          alt="Luxora Logo" 
          className="w-20 h-20" />

        </div>
        <div className="mb-5"> Welcome to the <strong className="text-luxora">Luxora</strong> marketplace!</div>

        {!isLoading && (
          <div className="w-100  flex flex-col gap-3 items-center justify-center">
            <OauthButton
              icon={<FaGithub />}
              href="https://api.luxoras.nl/auth/github"
            >
              Authenticate with GitHub
            </OauthButton>
            <OauthButton
              icon={<FcGoogle />}
              href="https://api.luxoras.nl/auth/google"
            >
              Authenticate with Google
            </OauthButton>
            <Link
              to={"/"}
              className="text-text-primary/50 font-thin hover:text-text-primary duration-300 "
            >
              Go back home
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
