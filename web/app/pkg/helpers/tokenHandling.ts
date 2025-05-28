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
