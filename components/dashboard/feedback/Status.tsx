"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { IStatus } from "@/interface/status.interface";

interface IProps {
  status: IStatus;
}

export default function Status({ status }: IProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox id={status.id} />
        <label htmlFor={status.id} className="text-sm font-lgiht">
          {status.name}
        </label>
      </div>
    </>
  );
}
