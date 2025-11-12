"use client";

import { saveBoard } from "@/app/actions/boardActions";
import { BoardInput, boardSchema } from "@/lib/validation/board";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Board() {
  const [urlInput, setUrlInput] = useState("");

  const formattedUrl = (url: string) => {
    const formattedUrl = url.replace(/\s+/g, "-");
    setUrlInput(formattedUrl);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BoardInput>({
    resolver: zodResolver(boardSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: BoardInput) => {
    const res = await saveBoard(values);
    if (!res.ok) {
      console.log(res.error);
      return;
    } else {
      redirect("/dashboard/feedback");
    }
  };

  return (
    <main className="mt-16 items-center justify-center flex flex-col w-full">
      <div className="border p-12 rounded-xl">
        <div className="text-center mb-12">
          <h1 className="font-bold text-3xl">Create a New Board</h1>
          <h4 className="font-light text-gray-400 text-md mt-2">
            A board is a place where people can post and vote on ideas for a
            specific topic.
          </h4>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full text-sm">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto px-6">
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="name">Name</label>
              <input
                className="border p-2 border-gray-300 rounded-lg"
                id="name"
                placeholder="Feature Request"
                {...register("name")}
                aria-invalid={!!errors.name}
              ></input>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="url">Url</label>
              <input
                className="border p-2 border-gray-300 rounded-lg"
                id="url"
                placeholder="feature-request"
                {...register("url")}
                aria-invalid={!!errors.url}
                onChange={(e) => formattedUrl(e.target.value)}
                value={urlInput}
              ></input>
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.url.message}
                </p>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="bg-primary text-white w-auto font-bold rounded-sm hover:bg-primary-200 px-8 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Board..." : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
