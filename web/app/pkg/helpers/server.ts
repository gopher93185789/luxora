import { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { authCookie } from "~/routes/auth_.cookie";

export async function getTokenFromServerSideCaller(
  r: LoaderFunctionArgs
): Promise<string> {
  const cookieHeader = r.request.headers.get("Cookie");
  const token = await authCookie.parse(cookieHeader);

  return token;
}
