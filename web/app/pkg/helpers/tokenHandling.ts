import { createCookie } from "@remix-run/cloudflare";

export function GetTokenFromLocalStorage(): string {
  let token = localStorage.getItem("AT");
  if (!token) return "";
  return token;
}
export function DeleteTokenFromLocalStorage(): void {
  localStorage.removeItem("AT");
}
export function SetTokenInLocalStorage(token: string): void {
  localStorage.setItem("AT", token);
}


export const laxCookie = createCookie("LUXORA_ACCESS_TOKEN");

export async function GetTokenFromRequest(request: Request): Promise<string> {
  const cookieHeader = request.headers.get("Cookie");
  const token = await laxCookie.parse(cookieHeader);
  return token ?? "";
}