import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search, SendHorizontal } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-gradient-to-b from-[#100719] to-[#1c1a3f] flex items-center justify-center">
      <main className="flex flex-col items-center justify-center w-full">
        <h1 className="text-white text-6xl mb-30">
          <span className="drop-shadow-[0_0_8px_#fff]">GO-REDIS</span>{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">DATABASE TESTING</span>
        </h1>

        <div className="relative w-2/4">
          <div className="p-[5px] rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
            <Input
              className="text-white px-24 py-8 w-full rounded-full bg-[#111014] placeholder-gray-400 border-none !text-2xl"
              placeholder="Search for a Movie"
            />
          </div>

          <Search color="#fff" className="absolute top-5 left-8 w-8 h-8" />

          <button className="absolute top-2.5 right-3 py-2.5 px-6 rounded-l-xl rounded-r-full bg-[#202020] hover:bg-purple-500 active:bg-purple-300 transition-all duration-300 cursor-pointer">
            <SendHorizontal color="#fff" className="w-8 h-8" />
          </button>
        </div>
      </main>
    </div>
  );
}
