"use client"

import { useState } from "react"
import {
  Calendar, RangeCalendar, MonthPicker, TimePicker, DatePicker,
  type DateRange, type TimeValue,
} from "@/components/ui/date-picker"

export function DatePickerDemo() {
  const [single, setSingle] = useState<Date | undefined>(new Date(2022, 7, 4)) // Aug 4 2022
  const [range, setRange] = useState<DateRange>({
    from: new Date(2022, 7, 25),
    to: new Date(2022, 8, 10),
  })
  const [month, setMonth] = useState<number>(5) // June
  const [time, setTime] = useState<TimeValue>({ hours: 12, minutes: 10, period: "PM" })
  const [pickerSingle, setPickerSingle] = useState<Date | undefined>()
  const [pickerRange, setPickerRange] = useState<DateRange>({ from: undefined, to: undefined })

  return (
    <div className="flex flex-col gap-16">

      {/* ── Single Calendar ── */}
      <section className="flex flex-col gap-6">
        <h4>Date Picker</h4>

        <div className="flex flex-col gap-3">
          <h6>Single — Calendar</h6>
          <Calendar value={single} onChange={setSingle} />
        </div>

        <div className="flex flex-col gap-3">
          <h6>Range — Calendar</h6>
          <RangeCalendar
            value={range}
            onChange={setRange}
            onApply={r => setRange(r)}
            onCancel={() => setRange({ from: undefined, to: undefined })}
          />
        </div>

        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex flex-col gap-3">
            <h6>Month Picker</h6>
            <MonthPicker value={month} currentMonth={3} onChange={setMonth} />
          </div>

          <div className="flex flex-col gap-3">
            <h6>Time Picker</h6>
            <TimePicker value={time} onChange={setTime} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h6>Input Trigger — Single</h6>
          <DatePicker mode="single" value={pickerSingle} onChange={v => setPickerSingle(v as Date)} />
        </div>

        <div className="flex flex-col gap-3">
          <h6>Input Trigger — Range</h6>
          <DatePicker mode="range" value={pickerRange} onChange={v => setPickerRange(v as DateRange)} />
        </div>
      </section>
    </div>
  )
}
