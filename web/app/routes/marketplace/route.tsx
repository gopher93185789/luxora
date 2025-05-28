import { useEffect } from "react"
import { GetUserDetails } from "~/pkg/api/auth"



export default function Dashboard() {
    useEffect(() => {
        const handle = async () => {
            const resp = await  GetUserDetails()
            console.log(resp)
        }

        handle()
    }, [])

    return (
        <>
        </>
    )
}