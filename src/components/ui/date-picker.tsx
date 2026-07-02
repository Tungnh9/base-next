"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarDays, Clock3 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// ─── Locale-aware calendar helpers ────────────────────────────────────────────

function getMonthName(locale: string, year: number, month: number): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(year, month))
}

function getDayLabels(locale: string): string[] {
  // 2024-01-07 is a Sunday — generate 7 labels starting from Sunday
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 7 + i))
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isToday(d: Date) {
  return isSameDay(d, new Date())
}

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}

function getFirstDayOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay()
}

function shiftMonth(y: number, m: number, delta: number): [number, number] {
  const d = new Date(y, m + delta, 1)
  return [d.getFullYear(), d.getMonth()]
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function formatDate(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export interface TimeValue {
  hours: number    // 1–12
  minutes: number  // 0–59
  period: "AM" | "PM"
}

// ─── Nav Button ───────────────────────────────────────────────────────────────

function NavButton({
  icon,
  onClick,
  className,
}: {
  icon: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "size-7 rounded-full border border-border flex items-center justify-center",
        "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors cursor-pointer",
        className
      )}
    >
      {icon}
    </button>
  )
}

// ─── Month Grid ───────────────────────────────────────────────────────────────

interface MonthGridProps {
  year: number
  month: number
  mode: "single" | "range"
  selected?: Date
  rangeFrom?: Date
  rangeTo?: Date
  hovered?: Date
  onSelect: (d: Date) => void
  onHover?: (d: Date | undefined) => void
}

function MonthGrid({
  year, month, mode, selected, rangeFrom, rangeTo, hovered, onSelect, onHover,
}: MonthGridProps) {
  const locale = useLocale()
  const dayLabels = getDayLabels(locale)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const [prevY, prevM] = shiftMonth(year, month, -1)
  const [nextY, nextM] = shiftMonth(year, month, 1)
  const prevMonthDays = getDaysInMonth(prevY, prevM)

  // Build 6×7 grid
  const cells: { date: Date; outside: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ date: new Date(prevY, prevM, prevMonthDays - i), outside: true })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), outside: false })
  for (let d = 1; cells.length < 42; d++)
    cells.push({ date: new Date(nextY, nextM, d), outside: true })

  // Effective range ends (support hover preview)
  const hovDir = rangeFrom && hovered && !isSameDay(hovered, rangeFrom)
  const effFrom = hovDir && hovered! < rangeFrom! ? hovered! : rangeFrom
  const effTo = rangeTo ?? (hovDir && hovered! > rangeFrom! ? hovered : undefined)

  return (
    <div>
      {/* Day header row */}
      <div className="grid grid-cols-7 mb-1">
        {dayLabels.map(d => (
          <div key={d} className="h-9 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map(({ date, outside }, i) => {
          const t = date.getTime()
          const isStart = mode === "range" && effFrom && isSameDay(date, effFrom)
          const isEnd = mode === "range" && effTo && isSameDay(date, effTo)
          const inRange = mode === "range" && effFrom && effTo &&
            t > effFrom.getTime() && t < effTo.getTime()
          const isSel = mode === "single" && selected && isSameDay(date, selected)
          const isActive = mode === "single" ? isSel : (isStart || isEnd)
          const isTodayCell = !outside && isToday(date)
          const col = i % 7

          return (
            <div
              key={i}
              className="relative h-9 flex items-center justify-center"
              onMouseEnter={() => mode === "range" && !outside && onHover?.(date)}
              onMouseLeave={() => mode === "range" && onHover?.(undefined)}
            >
              {/* Range highlight strip */}
              {mode === "range" && (isStart || isEnd || inRange) && (
                <div
                  className={cn(
                    "absolute inset-y-[3px] bg-primary/[.16]",
                    inRange && "inset-x-0",
                    inRange && col === 0 && "rounded-l-full",
                    inRange && col === 6 && "rounded-r-full",
                    !outside && isStart && !isEnd && "left-1/2 right-0",
                    outside && isStart && !isEnd && "inset-x-0",
                    !outside && isEnd && !isStart && "left-0 right-1/2",
                    outside && isEnd && !isStart && "inset-x-0",
                    outside && isEnd && !isStart && col === 6 && "rounded-r-full",
                    isStart && isEnd && "inset-x-0 rounded-full",
                  )}
                />
              )}

              {/* Day button */}
              {!outside ? (
                <button
                  type="button"
                  onClick={() => onSelect(date)}
                  className={cn(
                    "relative z-10 size-9 rounded-full flex items-center justify-center",
                    "text-[15px] select-none transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    !isActive && "cursor-pointer",
                    isTodayCell && !isActive && "ring-2 ring-primary text-primary font-semibold",
                    isActive && "bg-primary text-primary-foreground font-semibold cursor-pointer",
                  )}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span className="size-9 rounded-full flex items-center justify-center text-[15px] text-muted-foreground/40 select-none">
                  {date.getDate()}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Calendar (Single) ────────────────────────────────────────────────────────

export interface CalendarProps {
  value?: Date
  onChange?: (d: Date) => void
  className?: string
}

export function Calendar({ value, onChange, className }: CalendarProps) {
  const locale = useLocale()
  const today = new Date()
  const [year, setYear] = React.useState(value?.getFullYear() ?? today.getFullYear())
  const [month, setMonth] = React.useState(value?.getMonth() ?? today.getMonth())

  // Sync view when controlled value changes externally
  const valueTs = value?.getTime() ?? null
  React.useEffect(() => {
    if (value) {
      setYear(value.getFullYear())
      setMonth(value.getMonth())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueTs])

  const prev = () => { const [y, m] = shiftMonth(year, month, -1); setYear(y); setMonth(m) }
  const next = () => { const [y, m] = shiftMonth(year, month, 1); setYear(y); setMonth(m) }

  return (
    <div className={cn(
      "w-[280px] rounded-xl bg-card p-4",
      "[filter:drop-shadow(0_4px_9px_rgba(75,70,92,0.10))]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="font-semibold text-[15px] text-foreground">
          {getMonthName(locale, year, month)} {year}
        </span>
        <div className="flex gap-2">
          <NavButton icon={<ChevronLeft className="size-4" />} onClick={prev} />
          <NavButton icon={<ChevronRight className="size-4" />} onClick={next} />
        </div>
      </div>

      <MonthGrid
        year={year}
        month={month}
        mode="single"
        selected={value}
        onSelect={d => onChange?.(d)}
      />
    </div>
  )
}

// ─── Range Calendar ───────────────────────────────────────────────────────────

export interface RangeCalendarProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  onApply?: (range: DateRange) => void
  onCancel?: () => void
  className?: string
}

export function RangeCalendar({ value, onChange, onApply, onCancel, className }: RangeCalendarProps) {
  const locale = useLocale()
  const t = useTranslations()
  const today = new Date()
  const [year, setYear] = React.useState(value?.from?.getFullYear() ?? today.getFullYear())
  const [month, setMonth] = React.useState(value?.from?.getMonth() ?? today.getMonth())
  const [hovered, setHovered] = React.useState<Date | undefined>()
  const [internal, setInternal] = React.useState<DateRange>(value ?? { from: undefined, to: undefined })

  // Sync internal state and view when controlled value changes externally
  const fromTs = value?.from?.getTime() ?? null
  const toTs = value?.to?.getTime() ?? null
  React.useEffect(() => {
    setInternal(value ?? { from: undefined, to: undefined })
    if (value?.from) {
      setYear(value.from.getFullYear())
      setMonth(value.from.getMonth())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTs, toTs])

  const [nextYear, nextMonth] = shiftMonth(year, month, 1)
  const prev = () => { const [y, m] = shiftMonth(year, month, -1); setYear(y); setMonth(m) }
  const next = () => { const [y, m] = shiftMonth(year, month, 1); setYear(y); setMonth(m) }

  function handleSelect(d: Date) {
    if (!internal.from || internal.to) {
      const next = { from: d, to: undefined }
      setInternal(next)
      onChange?.(next)
    } else {
      const range: DateRange = d < internal.from
        ? { from: d, to: internal.from }
        : { from: internal.from, to: d }
      setInternal(range)
      onChange?.(range)
    }
  }

  const displayRange =
    internal.from && internal.to
      ? `${formatDate(internal.from)}–${formatDate(internal.to)}`
      : internal.from
        ? `${formatDate(internal.from)}–...`
        : ""

  return (
    <div className={cn(
      "rounded-xl bg-card [filter:drop-shadow(0_4px_9px_rgba(75,70,92,0.10))] overflow-hidden",
      className
    )}>
      {/* Dual-month header */}
      <div className="flex items-center px-4 pt-4 pb-2 gap-2">
        <NavButton icon={<ChevronLeft className="size-4" />} onClick={prev} />
        <div className="flex flex-1">
          <span className="flex-1 text-center font-semibold text-[15px] text-foreground">
            {getMonthName(locale, year, month)} {year}
          </span>
          <span className="flex-1 text-center font-semibold text-[15px] text-foreground">
            {getMonthName(locale, nextYear, nextMonth)} {nextYear}
          </span>
        </div>
        <NavButton icon={<ChevronRight className="size-4" />} onClick={next} />
      </div>

      {/* Two month grids */}
      <div className="flex px-4 pb-2 gap-0 divide-x divide-border">
        <div className="flex-1 pr-4">
          <MonthGrid
            year={year}
            month={month}
            mode="range"
            rangeFrom={internal.from}
            rangeTo={internal.to}
            hovered={hovered}
            onSelect={handleSelect}
            onHover={setHovered}
          />
        </div>
        <div className="flex-1 pl-4">
          <MonthGrid
            year={nextYear}
            month={nextMonth}
            mode="range"
            rangeFrom={internal.from}
            rangeTo={internal.to}
            hovered={hovered}
            onSelect={handleSelect}
            onHover={setHovered}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
        <span className="flex-1 text-sm text-muted-foreground font-medium">{displayRange}</span>
        <Button variant="outline" size="sm" onClick={onCancel}>{t("common.cancel")}</Button>
        <Button
          size="sm"
          disabled={!internal.from || !internal.to}
          onClick={() => internal.from && internal.to && onApply?.(internal)}
        >
          {t("datePicker.apply")}
        </Button>
      </div>
    </div>
  )
}

// ─── Month Picker ─────────────────────────────────────────────────────────────

export interface MonthPickerProps {
  value?: number           // 0–11
  currentMonth?: number    // 0–11, highlights with light style
  onChange?: (month: number) => void
  className?: string
}

export function MonthPicker({ value, currentMonth, onChange, className }: MonthPickerProps) {
  const locale = useLocale()
  const today = new Date()
  const cur = currentMonth ?? today.getMonth()
  const year = today.getFullYear()

  return (
    <div className={cn(
      "w-[140px] rounded-xl bg-card py-2 [filter:drop-shadow(0_4px_9px_rgba(75,70,92,0.10))]",
      className
    )}>
      {Array.from({ length: 12 }, (_, i) => {
        const name = getMonthName(locale, year, i)
        const isActive = value === i
        const isCurrent = !isActive && i === cur

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i)}
            className={cn(
              "w-full px-4 py-2 text-[15px] text-center transition-colors rounded-[6px] cursor-pointer",
              !isActive && !isCurrent && "text-foreground hover:bg-accent",
              isCurrent && "bg-primary/[.16] text-primary font-medium",
              isActive && "bg-primary text-primary-foreground font-semibold",
            )}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}

// ─── Time Picker ──────────────────────────────────────────────────────────────

export interface TimePickerProps {
  value?: TimeValue
  onChange?: (t: TimeValue) => void
  className?: string
}

function TimeSegment({
  value,
  min,
  max,
  onChange,
  className,
}: {
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  className?: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState("")

  function commit(raw: string) {
    const n = parseInt(raw, 10)
    if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)))
    setEditing(false)
    setDraft("")
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={e => setDraft(e.target.value.replace(/\D/g, "").slice(0, 2))}
        onBlur={() => commit(draft || String(value))}
        onKeyDown={e => {
          if (e.key === "Enter") commit(draft || String(value))
          if (e.key === "Escape") { setEditing(false); setDraft("") }
        }}
        className={cn(
          "w-10 h-10 rounded-md border border-primary bg-transparent text-center font-semibold text-[17px] text-foreground outline-none",
          className
        )}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => { setEditing(true); setDraft("") }}
      className={cn(
        "w-10 h-10 rounded-md border border-border flex items-center justify-center",
        "font-semibold text-[17px] text-foreground hover:border-primary transition-colors select-none cursor-pointer",
        className
      )}
    >
      {pad(value)}
    </button>
  )
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const def: TimeValue = { hours: 12, minutes: 0, period: "AM" }
  const t = value ?? def

  const set = (patch: Partial<TimeValue>) => onChange?.({ ...t, ...patch })

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-xl bg-card px-4 py-3",
      "[filter:drop-shadow(0_4px_9px_rgba(75,70,92,0.10))]",
      className
    )}>
      <TimeSegment value={t.hours} min={1} max={12} onChange={v => set({ hours: v })} />
      <span className="text-[17px] font-bold text-muted-foreground">:</span>
      <TimeSegment value={t.minutes} min={0} max={59} onChange={v => set({ minutes: v })} />
      <button
        type="button"
        onClick={() => set({ period: t.period === "AM" ? "PM" : "AM" })}
        className="ml-1 w-10 h-10 rounded-md border border-border flex items-center justify-center font-semibold text-[15px] text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
      >
        {t.period}
      </button>
    </div>
  )
}

// ─── DatePicker (input + popover) ─────────────────────────────────────────────

export interface DatePickerProps {
  mode?: "single" | "range"
  value?: Date | DateRange
  onChange?: (v: Date | DateRange | undefined) => void
  placeholder?: string
  showTime?: boolean
  disabled?: boolean
  className?: string
}

function formatValue(mode: "single" | "range", value?: Date | DateRange): string {
  if (!value) return ""
  if (mode === "single") return formatDate(value as Date)
  const r = value as DateRange
  if (!r.from) return ""
  if (!r.to) return `${formatDate(r.from)} – ...`
  return `${formatDate(r.from)} – ${formatDate(r.to)}`
}

export function DatePicker({
  mode = "single",
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: DatePickerProps) {
  const t = useTranslations("datePicker")
  const [open, setOpen] = React.useState(false)

  const display = formatValue(mode, value)
  const ph = placeholder ?? (mode === "range" ? t("placeholderRange") : t("placeholder"))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 h-[38px] rounded-md border border-input bg-transparent",
            "px-3 text-sm text-foreground cursor-pointer transition-colors",
            "hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !display && "text-muted-foreground",
            mode === "range" ? "w-[260px]" : "w-[180px]",
            className
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-left truncate">{display || ph}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "p-0 w-auto [filter:drop-shadow(0_4px_9px_rgba(75,70,92,0.10))] border-none bg-transparent",
        )}
        align="start"
        sideOffset={6}
      >
        {mode === "single" ? (
          <Calendar
            value={value as Date | undefined}
            onChange={d => { onChange?.(d); setOpen(false) }}
          />
        ) : (
          <RangeCalendar
            value={value as DateRange | undefined}
            onChange={r => onChange?.(r)}
            onApply={r => { onChange?.(r); setOpen(false) }}
            onCancel={() => setOpen(false)}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
