"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type DateRange as TDateRange } from "react-day-picker";

interface IProps {
  value: TDateRange | undefined;
  onChange: (range: TDateRange | undefined) => void;
}

export function DateRange({ value, onChange }: IProps) {
  const [open, setOpen] = React.useState(false);

  const label = value?.from
    ? value.to
      ? `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`
      : value.from.toLocaleDateString()
    : "Select date";

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            <span className="truncate text-xs">{label}</span>
            <ChevronDownIcon className="shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            className="rounded-lg border shadow-sm"
          />
        </PopoverContent>
      </Popover>
      {value?.from && (
        <button
          onClick={() => onChange(undefined)}
          className="text-xs text-muted-foreground underline text-left"
        >
          Clear
        </button>
      )}
    </div>
  );
}
