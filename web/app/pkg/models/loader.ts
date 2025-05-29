import { SerializeFrom } from "@remix-run/server-runtime/dist/single-fetch";


export interface LoaderReturn<T = unknown> {
  requireRefresh: boolean;
  json: SerializeFrom<T>;
}
