"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { IStatus } from "@/interface/status.interface";

interface IProps {
  status: IStatus;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function Status({ status, checked, onCheckedChange }: IProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={status.id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />
      <label htmlFor={status.id} className="text-sm font-light cursor-pointer">
        {status.name}
      </label>
    </div>
  );
}
