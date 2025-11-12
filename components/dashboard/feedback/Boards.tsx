"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { IBoard } from "@/interface/board.interface";

interface IProps {
  board: IBoard;
}

export default function Boards({ board }: IProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox id={board.id} />
        <label htmlFor={board.id} className="text-sm font-lgiht">
          {board.name}
        </label>
      </div>
    </>
  );
}
