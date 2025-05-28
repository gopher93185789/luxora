import {
  GetTokenFromLocalStorage,
  SetTokenInLocalStorage,
} from "../helpers/tokenHandling";
import { AccessTokenResponse, ErrorResponse } from "../models/api";

export async function OauthExchange(
  code: string,
  state: string,
  provider: "github" | "google"
): Promise<ErrorResponse | undefined> {
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
    SetTokenInLocalStorage(data.access_token);
  } catch (e) {
    console.error(e);
    return { code: 500, message: "Unexpected error" } as ErrorResponse;
  }
}

export async function VerifyToken(): Promise<number> {
  const token = GetTokenFromLocalStorage();
  if (token === "") return 403;

  const req = async (): Promise<Response> => {
    const resp = await fetch(`https://api.luxoras.nl/verify?token=${token}`, {
      method: "GET",
      credentials: "include",
    });

    return resp;
  };

  try {
    let resp = await req();
    if (!resp.ok) {
      const ok = await Refresh();
      if (ok != 200) return 403;
    }

    return 200;
  } catch (e) {
    console.error(e);
    return 500;
  }
}

export async function Refresh(): Promise<number> {
  const token = GetTokenFromLocalStorage();
  if (token === "") return 403;
  
  try {
    const resp = await fetch(`https://api.luxoras.nl/refresh`, {
      method: "GET",
      credentials: "include",
    });

    if (!resp.ok) throw (await resp.json()) as ErrorResponse;

    const data = (await resp.json()) as AccessTokenResponse;
    SetTokenInLocalStorage(data.access_token);
    return 200;
  } catch (e) {
    console.error(e);
    return 500;
  }
}
