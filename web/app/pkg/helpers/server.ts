import { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { authCookie } from "~/routes/auth_.cookie";

export async function getTokenFromServerSideCaller(
  r: LoaderFunctionArgs
): Promise<string | null> {
  try {
    const cookieHeader = r.request.headers.get("Cookie");
    
    if (!cookieHeader) {
      console.log("No cookie header found");
      return null;
    }
    
    const token = await authCookie.parse(cookieHeader);
    console.log("Parsed token exists:", !!token);
    
    return token || null;
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    return null;
  }
}
