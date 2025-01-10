"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight, Search, WandSparkles } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="h-dvh w-full flex flex-col justify-center items-center">

      <div className="w-fit h-fit relative flex flex-col justify-center items-center px-40 py-14">
        <Image
          src="/puzzle.png"
          className="inline-flex absolute top-0 left-24"
          width={75}
          height={75}
          alt={"puzzle illustration"}
        />
        <Image
          src="/forkpurple.png"
          className="inline-flex absolute top-16 left-0"
          width={75}
          height={75}
          alt={"fork illustration"}
        />
        <Image
          src="/egg.png"
          className="inline-flex absolute top-48 left-20"
          width={75}
          height={75}
          alt={"egg illustration"}
        />

        <Image
          src="/forkcircle.png"
          className="inline-flex absolute top-0 right-24"
          width={75}
          height={75}
          alt={"fork circle illustration"}
        />
        <Image
          src="/chef.png"
          className="inline-flex absolute top-20 right-0"
          width={75}
          height={75}
          alt={"fork circle illustration"}
        />
        <Image
          src="/forkyellow.png"
          className="inline-flex absolute top-40 right-24"
          width={75}
          height={75}
          alt={"fork circle illustration"}
        />
        <h1 className="text-6xl font-medium text-center max-w-[935px] tracking-[-0.06em] leading-tight">
          tell us about your
          {' '}
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            perfect restaurant experience
          </span>
          {' '}
          in
          {' '}
          <span className="text-gray-600">
            Paris
          </span>
          {' '}
          and we find it
        </h1>
        <div className="mt-8 w-full max-w-[740px] px-4 flex flex-col justify-center items-center">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Describe the experience you want to have..."
              className={cn(
                // base
                "w-full h-14 pl-12 pr-16 text-lg rounded-xl bg-gray-100 shadow-none border-none focus:border-gray-500",
              )}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-purple-900 transition-colors"
            >
              <WandSparkles className="w-5 h-5" />
            </button>
          </div>
          <button className="mt-4 text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center group">
            Curious how we scraped all the data for this project? Click here
            <ArrowRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </main >
  );
}
