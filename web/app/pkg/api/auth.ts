import {
  GetTokenFromLocalStorage,
  SetTokenInLocalStorage,
} from "../helpers/tokenHandling";
import { AccessTokenResponse, ErrorResponse, UserDetails } from "../models/api";

export async function OauthExchange(
  code: string,
  state: string,
  provider: "github" | "google"
): Promise<ErrorResponse | undefined> {
  if (code === "" || state === "")
    return { code: 400, message: "invalid code or state" } as ErrorResponse;

  try {
    const resp = await fetch(
      `https://api.luxoras.nl/auth/${provider}/exchange?code=${code}&state=${state}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = (await resp.json()) as AccessTokenResponse | ErrorResponse;
    console.log(data)
    if (!resp.ok) return data as ErrorResponse;

    const tokenResponse = data as AccessTokenResponse;
    if (!tokenResponse.access_token)
      throw new Error("failed to get access token");
    SetTokenInLocalStorage(tokenResponse.access_token);
  } catch (e) {
    console.error(e);
    return { code: 500, message: "Unexpected error" } as ErrorResponse;
  }
}

export async function VerifyToken(): Promise<number> {
  const token = GetTokenFromLocalStorage();
  if (token === "") return 403;

  const req = async (): Promise<Response> => {
    const resp = await fetch(
      `https://api.luxoras.nl/auth/verify?token=${token}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

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
    const resp = await fetch(`https://api.luxoras.nl/auth/refresh`, {
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

export async function GetUserDetails(token: string): Promise<UserDetails | ErrorResponse> {
  if (token === "")
    return { code: 403, message: "missing auth token" } as ErrorResponse;

  const req = async (): Promise<Response> => {
    const resp = await fetch(`https://api.luxoras.nl/auth/userinfo`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    return resp;
  };

  try {
    let resp = await req();
    if (!resp.ok) {
      return (await resp.json()) as ErrorResponse;
    }

    return (await resp.json()) as UserDetails;
  } catch (e) {
    console.error(e);
    return {
      code: 401,
      message: "an unexpected error occured",
    } as ErrorResponse;
  }
}
