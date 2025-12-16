"use client";

import { format, isValid, parseISO, startOfMonth } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Icons } from "@/components/layouts/icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function CalendarDateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const parsedFrom = fromParam ? parseISO(fromParam) : null;
  const parsedTo = toParam ? parseISO(toParam) : null;

  const initialFrom = parsedFrom && isValid(parsedFrom) ? parsedFrom : null;
  const initialTo = parsedTo && isValid(parsedTo) ? parsedTo : null;

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialFrom ?? startOfMonth(new Date()),
    to: initialTo ?? new Date(),
  });

  // Si el usuario navega/cambia query params, sincroniza el estado local
  React.useEffect(() => {
    const nextFrom = initialFrom ?? startOfMonth(new Date());
    const nextTo = initialTo ?? new Date();
    setDate({ from: nextFrom, to: nextTo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromParam, toParam]);

  const onSelect = React.useCallback(
    (next: DateRange | undefined) => {
      setDate(next);

      const params = new URLSearchParams(searchParams.toString());

      if (next?.from) {
        params.set("from", format(next.from, "yyyy-MM-dd"));
      } else {
        params.delete("from");
      }

      if (next?.to) {
        params.set("to", format(next.to, "yyyy-MM-dd"));
      } else {
        params.delete("to");
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <Icons.calendar className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default CalendarDateRangePicker;
