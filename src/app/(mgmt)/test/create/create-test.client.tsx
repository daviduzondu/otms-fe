'use client'

import React, { useContext, useState } from 'react'
import { useForm, Form } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format, differenceInMinutes, addMinutes, isBefore, startOfDay, isSameDay } from 'date-fns'
import { Clock } from 'lucide-react'
import { AuthContext } from '../../../../contexts/auth.context'
import { errorToast, successToast } from '../../../../helpers/show-toasts'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateTestSchema, CreateTestSchemaProps } from '../../../../validation/create-test.validation'
import { useRouter } from 'next/navigation';

export default function CreateTestClient() {
 const router = useRouter();
 const { user } = useContext(AuthContext);
 const { control, handleSubmit, watch, register, setValue, formState: { errors, isSubmitting } } = useForm<CreateTestSchemaProps>({ resolver: zodResolver(CreateTestSchema) })
 const [startsAt, setStartDate] = useState<Date>(addMinutes(new Date(), 120))
 const [endsAt, setEndDate] = useState<Date>(addMinutes(new Date(), 240))
 const [advancedSettings, setAdvancedSettings] = useState({
  maxAttempts: 1,
  passingScore: 70,
  randomizeQuestions: false,
  showResults: false,
  accessCode: '',
  preventTabSwitching: false,
  disableCopyPaste: false,
  requireFullScreen: false,
  showCorrectAnswers: false,
  provideExplanations: false,
 })

 localStorage.setItem('callbackUrl', '/test/create');
 
 const calculateDuration = () => {
  const durationInMinutes = differenceInMinutes(endsAt, startsAt)
  const hours = Math.floor(durationInMinutes / 60)
  const minutes = durationInMinutes % 60
  return `${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''}${hours > 0 && minutes > 0 ? ' and ' : ''}${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
 }


 const RequiredAsterisk = () => <span className="text-red-500">*</span>

 const handleSwitchChange = (fieldName: keyof CreateTestSchemaProps, value: boolean) => {
  setAdvancedSettings((prevSettings) => ({ ...prevSettings, [fieldName]: value }));
  setValue(fieldName, value); // Update form state with setValue
 };

 return (
  <Form className="w-full max-w-3xl p-6 flex" control={control} action={`${process.env.NEXT_PUBLIC_API_URL}/api/tests/create`} headers={{
   "Content-Type": "application/json",
   "Authorization": `Bearer ${user?.accessToken}`
  }}
   onSuccess={async ({ response }) => {
    const { data } = await response.json();
    router.push(`/test/${data.id}`)
    successToast("Test created successfully")
   }}
   onError={async (e) => errorToast((await e.response?.json()).message)}
   method="post">
   <Card>
    <CardHeader>
     <CardTitle className="text-3xl font-bold">Create New Test</CardTitle>
     <CardDescription>Set up your new test parameters</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
     <div className="space-y-2">
      <Label htmlFor="title">Test Title <RequiredAsterisk /></Label>
      <Input id="title" placeholder="Introduction to Python" {...register("title")} />
      {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
     </div>

     <div className="space-y-2">
      <Label htmlFor="instructions">Instructions</Label>
      <Textarea id="instructions" placeholder="Enter instructions for this test..." {...register("instructions")} />
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
       <Label>Start Date & Time <RequiredAsterisk /></Label>
       <Popover>
        <PopoverTrigger asChild>
         <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Clock className="mr-2 h-4 w-4" />
          {format(startsAt, "PPP p")}
         </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
         <Calendar
          mode="single"
          selected={startsAt}
          onSelect={(date) => {
           if (date) {
            const newDate = new Date(date)
            newDate.setHours(startsAt.getHours(), startsAt.getMinutes())
            setStartDate(newDate)
            if (isBefore(endsAt, newDate)) {
             setEndDate(addMinutes(newDate, 120))
            }
           }
          }}
          disabled={(date) => isBefore(date, startOfDay(new Date()))}
          initialFocus
         />
         <div className="p-3 border-t">
          <Input
           type="time"
           value={format(startsAt, "HH:mm")}
           onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':')
            const newDate = new Date(startsAt)
            newDate.setHours(parseInt(hours), parseInt(minutes))
            setStartDate(newDate)
            if (isBefore(endsAt, newDate)) {
             setEndDate(addMinutes(newDate, 120))
            }
           }}
          />
         </div>
        </PopoverContent>
       </Popover>
       <input value={startsAt.toString()} type='hidden' {...register("startsAt")} />
       {errors.startsAt && <p className="text-red-500 text-sm">{errors.startsAt.message}</p>}
      </div>
      <div className="space-y-2">
       <Label>End Date & Time <RequiredAsterisk /></Label>
       <Popover>
        <PopoverTrigger asChild>
         <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Clock className="mr-2 h-4 w-4" />
          {format(endsAt, "PPP p")}
         </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
         <Calendar
          mode="single"
          selected={endsAt}
          onSelect={(date) => {
           if (date) {
            const newDate = new Date(date)
            newDate.setHours(endsAt.getHours(), endsAt.getMinutes())
            if (isBefore(startsAt, newDate) || isSameDay(startsAt, newDate)) {
             setEndDate(newDate)
            }
           }
          }}
          disabled={(date) => isBefore(date, startOfDay(startsAt))}
          initialFocus
         />
         <div className="p-3 border-t">
          <Input
           type="time"
           value={format(endsAt, "HH:mm")}
           onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':')
            const newDate = new Date(endsAt)
            newDate.setHours(parseInt(hours), parseInt(minutes))
            if (isBefore(startsAt, newDate) || (isSameDay(startsAt, newDate) && newDate.getTime() > startsAt.getTime())) {
             setEndDate(newDate)
            }
           }}
          />
         </div>
        </PopoverContent>
       </Popover>
       <input value={startsAt.toString()} type='hidden' {...register("endsAt")} />
       {errors.endsAt && <p className="text-red-500 text-sm">{errors.endsAt.message}</p>}
      </div>
     </div>

     <input type='hidden' value={calculateDuration()} name="duration" />
     <div className="text-sm text-muted-foreground">
      This test will last {calculateDuration()}.
     </div>
     <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
       <Label htmlFor="passing-score">Passing Score (%)</Label>
       <Input
        id="passing-score"
        type="number"
        {...register("passingScore", { valueAsNumber: true })}
       />
       {errors.passingScore && <p className="text-red-500 text-sm">{errors.passingScore.message}</p>}
      </div>
     </div>
     <div className="space-y-2">
      <Label htmlFor="access-code">Access Code</Label>
      <Input
       id="access-code"
       type="text"
       value={advancedSettings.accessCode}
       onChange={(e) => setAdvancedSettings({ ...advancedSettings, accessCode: e.target.value })}
      />
     </div>
     {errors.randomizeQuestions && <div>{errors.randomizeQuestions.message}</div>}
     <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="advanced-settings">
       <AccordionTrigger className='flex items-center justify-center gap-2'>Advanced Settings</AccordionTrigger>
       <AccordionContent>
        <div className="space-y-4">
         <div className="space-y-2">
          <Label className="text-base text-muted-foreground">Test Options</Label>
          <div className="flex flex-col space-y-2">
           <div className="flex items-center justify-between">
            <Label htmlFor="randomize-questions" className="flex-grow">Randomize Question Order</Label>
            <Switch
             id="randomize-questions"
             checked={advancedSettings.randomizeQuestions}
             onCheckedChange={(checked) => handleSwitchChange("randomizeQuestions", checked)}
            />
            <input type='hidden' {...register('randomizeQuestions', { value: advancedSettings.randomizeQuestions })} />
           </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="show-results" className="flex-grow">Show Results Immediately</Label>
            <Switch
             id="show-results"
             checked={advancedSettings.showResults}
             onCheckedChange={(checked) => setAdvancedSettings({ ...advancedSettings, showResults: checked })}
            />
           </div>
          </div>
          <div className="flex flex-col space-y-2">
           <div className="flex items-center justify-between">
            <Label htmlFor="show-correct-answers" className="flex-grow">Show Correct Answers</Label>
            <Switch
             id="show-correct-answers"
             checked={advancedSettings.showCorrectAnswers}
             onCheckedChange={(checked) => handleSwitchChange("showCorrectAnswers", checked)}
            />
            <input type='hidden' {...register('showCorrectAnswers', { value: advancedSettings.showCorrectAnswers })} />
           </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="provide-explanations" className="flex-grow">Provide Explanations</Label>
            <Switch
             id="provide-explanations"
             checked={advancedSettings.provideExplanations}
             onCheckedChange={(checked) => handleSwitchChange("provideExplanations", checked)}
            />
            <input type='hidden' {...register('provideExplanations', { value: advancedSettings.provideExplanations })} />
           </div>
          </div>
         </div>
         <div className="space-y-2">
          <Label className="text-base text-muted-foreground">Security</Label>
          <div className="flex flex-col space-y-2">
           {/* <div className="flex items-center justify-between">
            <Label htmlFor="prevent-tab-switching" className="flex-grow">Prevent Tab Switching</Label>
            <Switch
             id="prevent-tab-switching"
             checked={advancedSettings.preventTabSwitching}
             onCheckedChange={(checked) => setAdvancedSettings({
              ...advancedSettings,
              preventTabSwitching: checked
             })}
            />
           </div> */}
           <div className="flex items-center justify-between">
            <Label htmlFor="disable-copy-paste" className="flex-grow">Disable Copy/Paste</Label>
            <Switch
             id="disable-copy-paste"
             checked={advancedSettings.disableCopyPaste}
             onCheckedChange={(checked) => handleSwitchChange("disableCopyPaste", checked)}
            />
            <input type='hidden' {...register('disableCopyPaste', { value: advancedSettings.disableCopyPaste })} />
           </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="require-full-screen" className="flex-grow">Require Full Screen Mode</Label>
            <Switch
             id="require-full-screen"
             checked={advancedSettings.requireFullScreen}
             onCheckedChange={(checked) => handleSwitchChange("requireFullScreen", checked)}
            />
            <input type='hidden' {...register('requireFullScreen', { value: advancedSettings.requireFullScreen })} />
           </div>
          </div>
         </div>
        </div>
       </AccordionContent>
      </AccordionItem>
     </Accordion>
    </CardContent>
    <CardFooter>
     <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? "Creating Test" : "Create Test"}</Button>
    </CardFooter>
   </Card>
  </Form>
 )
}