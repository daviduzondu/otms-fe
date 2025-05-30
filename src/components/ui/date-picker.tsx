"use client"

import * as React from "react"
import {useEffect} from "react"
import {format} from "date-fns"
import {CalendarIcon} from "lucide-react"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Calendar} from "@/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"

export function DatePicker({date, setDate}: {
    date: Date | undefined,
    setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
}) {
    // const [date, setDate] = React.useState<Date>()

    useEffect(() => {
        console.log(date)
    }, [date])
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal pointer-events-auto z-40",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon/>
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    defaultMonth={new Date(new Date().getFullYear(), new Date().getMonth() + 6)}
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    // initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
