"use client";

import { CalendarIcon } from "lucide-react";
import { es as esLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const { locale } = useI18n();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <CalendarIcon className="h-4 w-4" />
          {value ? formatDate(value, locale) : (placeholder ?? "Pick a date")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          locale={locale === "es" ? esLocale : undefined}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
