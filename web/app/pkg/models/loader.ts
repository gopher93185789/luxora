import { SerializeFrom } from "@remix-run/server-runtime/dist/single-fetch";

export interface LoaderReturn {
  requireRefresh: boolean;
  json: SerializeFrom<T>;
}