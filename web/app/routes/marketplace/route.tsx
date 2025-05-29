import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { GetUserDetails } from "~/pkg/api/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");

  const cookies = Object.fromEntries(
    cookieHeader?.split("; ").map((cookie) => {
      const [name, ...rest] = cookie.split("=");
      return [name, rest.join("=")];
    }) || []
  );

  return JSON.stringify({ cookies });
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

  return <>
  <p className="text-white">{data}</p>
  </>;
}
