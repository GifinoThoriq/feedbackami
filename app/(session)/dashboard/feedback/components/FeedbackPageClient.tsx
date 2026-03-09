"use client";

import Boards from "@/components/dashboard/feedback/Boards";
import { DateRange } from "@/components/dashboard/feedback/DateRange";
import Status from "@/components/dashboard/feedback/Status";
import { IBoard } from "@/interface/board.interface";
import { IPost } from "@/interface/post.interface";
import { IStatus } from "@/interface/status.interface";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { type DateRange as TDateRange } from "react-day-picker";
import { User } from "@supabase/supabase-js";
import FeedbackSection from "./FeedbackSection";

interface IProps {
  boards: IBoard[];
  statuses: IStatus[];
  feedback: IPost[];
  author: User | null;
}

export default function FeedbackPageClient({ boards, statuses, feedback, author }: IProps) {
  const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>([]);
  const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<TDateRange | undefined>(undefined);

  function toggleBoard(id: string, checked: boolean) {
    setSelectedBoardIds((prev) =>
      checked ? [...prev, id] : prev.filter((b) => b !== id)
    );
  }

  function toggleStatus(id: string, checked: boolean) {
    setSelectedStatusIds((prev) =>
      checked ? [...prev, id] : prev.filter((s) => s !== id)
    );
  }

  return (
    <div className="grid grid-cols-12">
      <aside className="hidden col-span-2 flex-col text-sidebar-foreground md:flex">
        <nav className="flex-1 overflow-y-auto px-3 py-4 border-r">
          <div className="space-y-1">
            <Link href="/dashboard/board">
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
              <DateRange value={dateRange} onChange={setDateRange} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="px-3 py-2">
              <h6 className="text-sm font-bold">Boards</h6>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex px-4 flex-col gap-2">
              {boards.map((item) => (
                <Boards
                  key={item.id}
                  board={item}
                  checked={selectedBoardIds.includes(item.id)}
                  onCheckedChange={(checked) => toggleBoard(item.id, checked)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="px-3 py-2">
              <h6 className="text-sm font-bold">Status</h6>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex px-4 flex-col gap-2">
              {statuses.map((item) => (
                <Status
                  key={item.id}
                  status={item}
                  checked={selectedStatusIds.includes(item.id)}
                  onCheckedChange={(checked) => toggleStatus(item.id, checked)}
                />
              ))}
            </div>
          </div>
        </nav>
      </aside>

      <div className="col-span-10 grid grid-cols-10">
        <FeedbackSection
          feedback={feedback}
          boards={boards}
          statuses={statuses}
          author={author}
          selectedBoardIds={selectedBoardIds}
          selectedStatusIds={selectedStatusIds}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
}
