import { Refresh } from "../api/auth";

type ApiFunction = () => Promise<Response>;

export async function  withRefresh(fn:ApiFunction):Promise<Response | undefined> {
    let resp = await fn()

    if (resp.status === 403 || resp.status === 401) {
        const r = await Refresh()
        if (r !== 200) return 
        resp = await fn()
    }

    return resp
}