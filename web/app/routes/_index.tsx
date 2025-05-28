import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "luxora" },
    { name: "description", content: "The marketplace for the rich by the rich" },
  ];
};

export default function HomePage() {
  return(
    <main>
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
    </main>
  )
}