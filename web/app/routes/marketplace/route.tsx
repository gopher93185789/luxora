import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { GetUserDetails } from "~/pkg/api/auth";
import { authCookie } from "../auth.cookie";
import { getTokenFromServerSideCaller } from "~/pkg/helpers/server";


export async function loader(lfa: LoaderFunctionArgs) {
  const token = getTokenFromServerSideCaller(lfa)
  return JSON.stringify({ token});
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
