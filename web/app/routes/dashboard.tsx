import { json, redirect } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import cookie from "cookie";
import { useLoaderData } from "@remix-run/react";

// Helper functie
function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookie.parse(cookieHeader);
  return cookies["token"] || null;
}

type User = {
  id: string;
  username: string;
  email: string;
  profile_image_link: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const token = extractTokenFromCookie(cookieHeader);

  if (!token) {
    return redirect("/login");
  }

  const response = await fetch("https://api.luxoras.nl/auth/userinfo", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    return redirect("/login");
  }

  if (!response.ok) {
    throw new Response("Failed to fetch user info", { status: response.status });
  }

  const user: User = await response.json();
  return json(user);
};

export default function Dashboard() {
  const user = useLoaderData<User>();

  return (
    <div>
      <h1>Welkom, {user.username}!</h1>
      <img
        src={user.profile_image_link}
        alt="Profielfoto"
        style={{ borderRadius: "50%", width: 100, height: 100 }}
      />
      <p>Email: {user.email}</p>
    </div>
  );
}
