import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "luxora" },
    { name: "description", content: "The marketplace for the rich by the rich" },
  ];
};

export default function HomePage() {
  return <></>
}