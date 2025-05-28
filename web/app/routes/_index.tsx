import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

import background from "~/public/video/rrbg.mp4";

export const meta: MetaFunction = () => {
  return [
    { title: "luxora" },
    { name: "description", content: "The marketplace for the rich by the rich" },
  ];
};


export default function HomePage() {
  return(
    <main
      className="bg w-screen h-screen"
    >
      <video className=" absolute w-full h-full object-cover" src={background} autoPlay loop muted/>
      <div>
        <p>
          Luxoras
        </p>
        <p>
          Indulge in what u deserve, the luxuries of life.
        </p>
        <button>
          <Link to={"/auth"} >
            Dive into luxury
          </Link>
        </button>
      </div>
    </main>
  )
}