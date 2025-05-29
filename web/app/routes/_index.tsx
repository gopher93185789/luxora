import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "luxora" },
    {
      name: "description",
      content: "The marketplace for the rich by the rich",
    },
  ];
};

export default function HomePage() {
  return (
    <main className="bg w-screen h-screen">
      <video
        className="absolute w-full -z-10 h-full object-cover"
        src={"/rrbg.mp4"}
        autoPlay
        loop
        muted
      />
      <div className="w-full h-24 flex flex-row items-center justify-center relative">
        <p className="text-white font-bold text-2xl">Luxoras</p>
        <div className="absolute w-full h-42 -z-5 bg-gradient-to-b from-black " />
      </div>
    </main>
  );
}
