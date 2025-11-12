"use server";

import { getBoards } from "@/app/actions/boardActions";
import { getStatus } from "@/app/actions/statusActions";
import Boards from "@/components/dashboard/feedback/Boards";
import { DateRange } from "@/components/dashboard/feedback/DateRange";
import Status from "@/components/dashboard/feedback/Status";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import FeedbackSection from "./components/FeedbackSection";
import { getMyPosts } from "@/app/actions/postActions";

export default async function Feedback() {
  const boards = await getBoards();
  const status = await getStatus();
  const feedback = await getMyPosts();

  return (
    <>
      <div className="grid grid-cols-12">
        <aside className="hidden col-span-2 flex-col text-sidebar-foreground md:flex">
          <nav className="flex-1 overflow-y-auto px-3 py-4 border-r">
            <div className="space-y-1">
              <Link href={"/dashboard/board"}>
                <button className="py-2 px-3 text-primary rounded-lg font-normal text-sm flex items-center gap-2 mb-2 w-full">
                  <PlusIcon className="size-4" /> Add Board
                </button>
              </Link>
            </div>

            <div className="space-y-1">
              <div className="px-3 py-2">
                <h6 className="text-sm font-bold">Date Range</h6>
              </div>
            </div>
            <div className="space-y-1">
              <div className="px-4">
                <DateRange />
              </div>
            </div>

            {/* LIST OF BOARDS */}
            <div className="space-y-1">
              <div className="px-3 py-2">
                <h6 className="text-sm font-bold">Boards</h6>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex px-4 flex-col gap-2">
                {boards.map((item) => (
                  <Boards key={item.id} board={item} />
                ))}
              </div>
            </div>

            {/* LIST OF STATUS */}
            <div className="space-y-1">
              <div className="px-3 py-2">
                <h6 className="text-sm font-bold">Status</h6>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex px-4 flex-col gap-2">
                {status.map((item) => (
                  <Status key={item.id} status={item} />
                ))}
              </div>
            </div>
          </nav>
        </aside>
        <div className="col-span-10 grid grid-cols-10">
          <FeedbackSection feedback={feedback} boards={boards} />
        </div>
      </div>
    </>
  );
}
