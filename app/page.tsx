"use client";

import { Input } from "@/components/ui/input";
import StaggeredFadeLoader from "@/components/ui/staggered-fade-loader";
import { cn } from "@/lib/utils";
import { generateId } from "ai";
import { useChat } from "ai/react";
import { ArrowRight, CircleDollarSign, MapPin, Search, Star, User, UtensilsCrossed, WandSparkles, X, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  const { input, handleInputChange, handleSubmit, messages, setMessages, isLoading, setInput, error } = useChat();

  const handleSubmitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    if (messages.length > 1 && input.length > 0) {
      setMessages([{ role: "user", content: input, id: generateId() }]);
    }
    handleSubmit(event);
  }

  console.log(messages);

  const handleReset = () => {
    setMessages([]);
    setInput("");
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-dvh w-full flex flex-col justify-center items-center py-36 px-0 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-fit h-fit relative flex flex-col justify-center items-center px-2 sm:px-8 md:px-40 py-14"
      >
        <Image
          src="/puzzle.png"
          className="hidden md:inline-flex absolute top-0 left-24"
          width={75}
          height={75}
          alt={"puzzle illustration"}
        />
        <Image
          src="/forkpurple.png"
          className="hidden md:inline-flex absolute top-16 left-0"
          width={75}
          height={75}
          alt={"fork illustration"}
        />
        <Image
          src="/egg.png"
          className="hidden md:inline-flex absolute top-48 left-20"
          width={75}
          height={75}
          alt={"egg illustration"}
        />

        <Image
          src="/forkcircle.png"
          className="hidden md:inline-flex absolute top-0 right-24"
          width={75}
          height={75}
          alt={"fork circle illustration"}
        />
        <Image
          src="/chef.png"
          className="hidden md:inline-flex absolute top-20 right-0"
          width={75}
          height={75}
          alt={"fork circle illustration"}
        />
        <Image
          src="/forkyellow.png"
          className="hidden md:inline-flex absolute top-40 right-24"
          width={75}
          height={75}
          alt={"fork circle illustration"}
        />
        <motion.h1
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.4 }}
          className="text-4xl sm:text-5xl md:text-6xl font-medium text-center max-w-[935px] tracking-[-0.06em] leading-tight"
        >
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
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 w-full max-w-[740px] px-2 sm:px-4 flex flex-col justify-center items-center"
        >
          <form className="relative w-full" onSubmit={handleSubmitMessage}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              value={input}
              disabled={isLoading}
              onChange={handleInputChange}
              placeholder={
                isLoading ? "We are looking for the best restaurant for you..." : "Describe the experience you want to have..."
              }
              className={cn(
                // base
                "w-full h-14 pl-12 pr-16 text-lg rounded-xl bg-gray-100 shadow-none border-none focus:border-gray-500",
              )}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-purple-900 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? <StaggeredFadeLoader variant="dark" /> : <WandSparkles className="w-5 h-5" />}
            </button>
          </form>
          {messages.length === 0 && (
            <Link href='/test-scraping' className="mt-4 text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center group">
              Curious on how we scraped all the data for this project? Click here
              <ArrowRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          {messages.filter(message => message.role === "user").slice(-1).map((message) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              key={message.id}
              className="w-full mt-4 p-3 sm:p-6 bg-gray-100 rounded-xl border border-dashed border-gray-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Your Request</div>
                    <p className="mt-1 text-gray-600 leading-relaxed text-sm font-mono">{message.content}</p>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleReset}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset the interface</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          ))}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full mt-4 p-4 bg-red-50 rounded-xl border border-red-100"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-red-600">Error</div>
                  <p className="mt-1 text-red-600 text-sm">
                    {error instanceof Error ? error.message : 'An unexpected error occurred'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {messages.filter(message => message.role === "assistant").map((message) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              key={message.id}
              className="w-full"
            >
              <div>{message.content}</div>
              {
                message.toolInvocations?.map((tool) => {
                  if (tool.toolName === "suggestRestaurant" && tool.args) {
                    const params = tool.args;
                    return (
                      <motion.div
                        initial={{ opacity: 0, filter: "blur(5px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.3 }}
                        key={tool.toolCallId}
                        className={cn(
                          "mt-4 p-4 sm:p-6 bg-white rounded-xl shadow-sm border transition-all min-w-full",
                          params.featured
                            ? "border-purple-400 shadow-purple-100"
                            : "border-gray-200"
                        )}
                      >
                        {params.featured && (
                          <div className="mb-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium inline-flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-purple-700" />
                              Featured Pick
                            </span>
                          </div>
                        )}

                        <h3 className="text-2xl font-semibold text-gray-900">
                          {params.name || (
                            <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse" />
                          )}
                        </h3>

                        <div className="mt-3 flex flex-row sm:items-center gap-2 sm:gap-4">
                          {params.cuisine ? (
                            <span className="text-gray-600 flex items-center gap-1">
                              <UtensilsCrossed className="w-4 h-4" />
                              {params.cuisine}
                            </span>
                          ) : (
                            <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse" />
                          )}
                          <span className="text-gray-400 hidden sm:block">•</span>
                          {params.priceRange ? (
                            <span className="font-medium text-gray-900 flex items-center gap-1">
                              <CircleDollarSign className="w-4 h-4" />
                              {params.priceRange}
                            </span>
                          ) : (
                            <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse" />
                          )}
                          <span className="text-gray-400 hidden sm:block">•</span>
                          {params.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{params.rating}</span>
                            </div>
                          ) : (
                            <div className="h-5 w-12 bg-gray-200 rounded-md animate-pulse" />
                          )}
                        </div>

                        {params.address ? (
                          <div className="mt-4 flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                            <p className="text-gray-600 leading-snug">{params.address}</p>
                          </div>
                        ) : (
                          <div className="mt-4 flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-gray-300" />
                            <div className="h-5 w-64 bg-gray-200 rounded-md animate-pulse" />
                          </div>
                        )}

                        {params.reason ? (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700 leading-relaxed">{params.reason}</p>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-2">
                              <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                              <div className="h-4 w-5/6 bg-gray-200 rounded-md animate-pulse" />
                              <div className="h-4 w-4/6 bg-gray-200 rounded-md animate-pulse" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  }
                  return null;
                })
              }
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
