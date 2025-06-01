import { useEffect, useState } from "react";
import { GetTokenFromLocalStorage } from "../pkg/helpers/tokenHandling";
import { GetUserDetails } from "../pkg/api/auth";
import type { UserDetails, ErrorResponse } from "../pkg/models/api";

export function useUserInfo() {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      const token = GetTokenFromLocalStorage();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const result = await GetUserDetails(token);
      if ("code" in result && result.code !== 200) {
        setError(result as ErrorResponse);
        setUser(null);
      } else {
        setUser(result as UserDetails);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return { user, error, loading };
}
