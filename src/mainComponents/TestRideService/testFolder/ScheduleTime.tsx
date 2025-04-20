import { motion } from "framer-motion";
import { formatDate } from "../../../lib/dateUtils";
import { CalendarIcon, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepProps, timeSlots } from "../../../mockdata/data";
import { cn } from "../../../lib/utils";

export const ScheduleStep = ({
  formData,
  updateFormData,
  errors,
  fadeInUp,
}: StepProps) => {
  return (
    <motion.div
      key='step3'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Schedule Your Test Ride</h3>
      <div className='space-y-2'>
        <Label>Preferred Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.date && "text-muted-foreground",
                errors?.date && "border-red-500"
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {formData.date
                ? formatDate(formData.date, "PPP")
                : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='single'
              selected={formData.date}
              onSelect={(date) =>
                updateFormData && updateFormData("date", date)
              }
              disabled={
                (date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0)) || // No past dates
                  date >
                    new Date(new Date().setMonth(new Date().getMonth() + 2)) // Max 2 months ahead
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors?.date && <p className='text-red-500 text-sm'>{errors.date}</p>}
      </div>

      <div className='space-y-2'>
        <Label>Preferred Time</Label>
        <Select
          value={formData.time}
          onValueChange={(value) =>
            updateFormData && updateFormData("time", value)
          }
        >
          <SelectTrigger className={errors?.time ? "border-red-500" : ""}>
            <SelectValue placeholder='Select a time slot' />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.time && <p className='text-red-500 text-sm'>{errors.time}</p>}
      </div>

      <div className='p-4 bg-yellow-50 rounded-lg flex items-start gap-2'>
        <Info className='h-5 w-5 text-yellow-500 mt-0.5' />
        <p className='text-sm'>
          Test rides are approximately 30 minutes long. Please arrive 15 minutes
          before your scheduled time with a valid motorcycle license.
        </p>
      </div>
    </motion.div>
  );
};
