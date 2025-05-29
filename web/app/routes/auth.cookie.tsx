import { createCookie } from "@remix-run/cloudflare";
import { useNavigate } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/server-runtime";
import { useEffect } from "react";


export const authCookie = createCookie("auth-token", {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60,
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.json() as {tk:string};

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": await authCookie.serialize(data.tk),
      },
    }
  );
};

export default function Redirect() {
    const navigate = useNavigate()


  useEffect(() => {
    navigate("/auth");
  },[])

  return <>
  </>
}