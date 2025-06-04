import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { GetUserDetails, Refresh } from "~/pkg/api/auth";
import { getTokenFromServerSideCaller } from "~/pkg/helpers/server";
import { GetTokenFromLocalStorage } from "~/pkg/helpers/tokenHandling";
import { UserDetails } from "~/pkg/models/api";

export async function loader(lfa: LoaderFunctionArgs) {
  const token = await getTokenFromServerSideCaller(lfa);
  const resp = await GetUserDetails(token);

  if ("code" in resp) {
    return { requireRefresh: true };
  }

  return { requireRefresh: false, user: resp };
}

export default function Dashboard() {
  const { requireRefresh, user } = useLoaderData<typeof loader>();
  const [data, setData] = useState<UserDetails | undefined>(
    !requireRefresh ? user : undefined
  );
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      if (!requireRefresh) return;

      console.log("defaulting to csr");
      try {
        const rt = await Refresh();
        if (rt !== 200) throw new Error("Failed to refresh");

        const tk = GetTokenFromLocalStorage();
        await fetch("/auth/cookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tk }),
        });

        const token = GetTokenFromLocalStorage();
        const userData = await GetUserDetails(token);
        if ("code" in userData) throw new Error("Failed to fetch user");

        setData(userData);
      } catch {
        navigate("/auth");
      }
    };

    handle();
  }, [requireRefresh, navigate]);

  return (
    <>
      <div className="flex h-full w-full flex-col gap-5">
        <h1>Welkom, {data?.username}!</h1>
        <img
          className="h-32 w-32 rounded-full"
          src={data?.profile_image_link || "/images/default-avatar.png"}
          alt="User Avatar"
        />
        {data?.email.String === "" ? null : <p>Email: {data?.email.String}</p>}
      </div>

      <div className="h-screen w-full"></div>
      <div className="h-screen w-full"></div>
      <div className="h-screen w-full"></div>
    </>
  );
}
