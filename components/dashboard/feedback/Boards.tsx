"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { IBoard } from "@/interface/board.interface";

interface IProps {
  board: IBoard;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function Boards({ board, checked, onCheckedChange }: IProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={board.id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />
      <label htmlFor={board.id} className="text-sm font-light cursor-pointer">
        {board.name}
      </label>
    </div>
  );
}
