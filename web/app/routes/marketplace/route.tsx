import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { GetUserDetails } from "~/pkg/api/auth";
import { authCookie, rizz } from "../auth.cookie";




export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await authCookie.parse(cookieHeader);
  const token2 = await rizz.parse(cookieHeader);
  return JSON.stringify({ token, token2});
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    const handle = async () => {
      const resp = await GetUserDetails();
      console.log(resp);
    };

    handle();
  }, []);

  return (
    <>
      <p className="text-white">{data}</p>
    </>
  );
}
