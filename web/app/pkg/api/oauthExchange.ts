import { AccessTokenResponse, ErrorResponse } from "../models/api";

export async function OauthExchange(
  code: string,
  state: string,
  provider: "github" | "google"
): Promise<ErrorResponse | AccessTokenResponse> {
  if (code === "" || state === "")
    return { code: 400, message: "invalid code or state" } as ErrorResponse;

  try {
    const resp = await fetch(
      `https://api.luxoras.nl/auth/${provider}/exchange?code=${encodeURIComponent(
        code
      )}&state=${encodeURIComponent(state)}`,
      {
        method: "GET",
        credentials: "include", 
      }
    );

    if (!resp.ok) return (await resp.json()) as ErrorResponse;
    
    const data = (await resp.json()) as AccessTokenResponse;
    return data;
  }catch (e) {
    console.error(e);
    return { code: 500, message: "Unexpected error" } as ErrorResponse;
  }

}

