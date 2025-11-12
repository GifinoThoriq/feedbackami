"use client";

import { savePost } from "@/app/actions/postActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IBoard } from "@/interface/board.interface";
import { CreatePostInput, createPostSchema } from "@/lib/validation/post";

import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

interface IProps {
  open: boolean;
  onOpenChange: (e: boolean) => void;
  boards: IBoard[];
}

export function PostForm({ open, onOpenChange, boards }: IProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: CreatePostInput) => {
    console.log("masuk");
    const res = await savePost(values);

    if (!res.ok) {
      console.log(res.error);
      return;
    } else {
      router.push("/dashboard/feedback");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 rounded">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-md font-medium">Create Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 p-4 pt-0 text-sm">
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="board">Board *</label>
              <Controller
                name="board_id"
                control={control}
                rules={{ required: "Please choose a board." }}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="border p-2 border-gray-300 rounded w-full">
                      <SelectValue placeholder="Board" />
                    </SelectTrigger>
                    <SelectContent aria-invalid={!!errors.board_id}>
                      {boards.map((board) => (
                        <SelectItem key={board.id} value={board.id}>
                          {board.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.board_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.board_id.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 col-span-2 text-sm">
              <label htmlFor="title">Title*</label>
              <input
                className="border p-2 border-gray-300 rounded"
                id="title"
                placeholder="Feature Request"
                {...register("title")}
                aria-invalid={!!errors.title}
              ></input>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 col-span-2 text-sm">
              <label htmlFor="details">Details</label>
              <textarea
                className="border p-2 border-gray-300 rounded"
                id="details"
                placeholder="Any additional details..."
                {...register("details")}
                aria-invalid={!!errors.details}
              ></textarea>
              {errors.details && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.details.message}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 border-t flex gap-2 items-center justify-end">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {" "}
              {isSubmitting ? "Creating Post..." : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
