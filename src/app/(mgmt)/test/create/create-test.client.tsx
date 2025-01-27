'use client'

import React, { useContext, useEffect, useState } from 'react'
import { Controller, Form, useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { addMinutes, differenceInMinutes } from 'date-fns'
import { AuthContext } from '../../../../contexts/auth.context'
import { errorToast, infoToast, successToast } from '../../../../helpers/show-toasts'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateOrEditTestSchema, CreateorEditTestSchemaProps } from '../../../../validation/test.validation'
import { useRouter } from 'next/navigation';
import { Slider } from '../../../../components/ui/slider'
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group'
import { Laptop, Loader, Smartphone } from 'lucide-react'
import { TestDetails } from '../../../../types/test'
import { cn } from '../../../../lib/utils'

export default function CreateTestClient({ initialData, onEditSuccessful }: { initialData?: TestDetails, onEditSuccessful: (data: TestDetails) => void }) {
 const router = useRouter();
 const { user } = useContext(AuthContext);
 const {
  control,
  handleSubmit,
  watch,
  register,
  getValues,
  setValue,
  formState: { errors, isSubmitting }
 } = useForm<CreateorEditTestSchemaProps>({
  resolver: zodResolver(CreateOrEditTestSchema), defaultValues: {
   title: initialData?.title,
   instructions: initialData?.instructions,
   platform: initialData?.platform,
   // instructions: initialData?.instructions
  }
 })
 const [advancedSettings, setAdvancedSettings] = useState({
  randomizeQuestions: !!initialData?.randomizeQuestions,
  showResultsAfterTest: !!initialData?.showResultsAfterTest,
  disableCopyPaste: !!initialData?.disableCopyPaste,
  requireFullScreen: !!initialData?.requireFullScreen,
 })



 const RequiredAsterisk = () => <span className="text-red-500">*</span>

 const handleSwitchChange = (fieldName: keyof CreateorEditTestSchemaProps, value: boolean) => {
  setAdvancedSettings((prevSettings) => ({ ...prevSettings, [fieldName]: value }));
  setValue(fieldName, value); // Update form state with setValue
 };

 useEffect(() => {
  setValue('durationMin', 30)
 }, [])

 return (
  <Form className={`w-full max-w-3xl flex items-center ${!initialData && "pb-4"} justify-center`} control={control}
   action={`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${!initialData ? "create" : "edit"}`} headers={{
    "Content-Type": "application/json",
    "Authorization": `Bearer ${user?.accessToken}`
   }}
   onSuccess={async ({ response }) => {
    const { data } = await response.json();
    if (!initialData) router.replace(`/test/${data.id}`);
    if (initialData) onEditSuccessful(data);
    !initialData ? successToast("Test created successfully") : infoToast("Test edited successfully")
   }}
   onError={async (e) => errorToast((await e.response?.json())?.message || "Network error")}
   method={initialData ? 'put' : 'post'}
  >
   <Card className={cn(`${initialData ? "w-full border-0 p-0" : "lg:min-w-[40vw] "} h-full flex flex-col`)}>
    {!initialData ? <CardHeader>
     <CardTitle className="text-xl font-bold">Create New Test</CardTitle>
     <CardDescription>Set up your new test parameters</CardDescription>
    </CardHeader> : null}
    <CardContent className={`space-y-6 flex-1 ${initialData ? "p-0" : ''}`}>
     <div className="space-y-2">
      <Label htmlFor="title">Test Title <RequiredAsterisk /></Label>
      <Input id="title" placeholder="Introduction to Python" {...register("title")} />
      {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
     </div>

     <div className="space-y-2">
      <Label htmlFor="instructions">Instructions</Label>
      <Textarea id="instructions"
       rows={5}
       placeholder="Enter instructions for this test..." {...register("instructions")} />
     </div>

     {!initialData ? <div className="space-y-3">
      <Label htmlFor="instructions">Duration (minutes)</Label>
      <Controller
       name="durationMin"
       control={control}
       render={({ field }) => (
        <>
         <Slider
          min={30}
          max={180}
          value={[field.value]} // Sync with the form value
          onValueChange={(value) => {
           console.log(value)
           setValue("durationMin", value[0]); // Update form state
          }}
         />
         <div className="text-sm text-muted-foreground">
          This test will last {field.value} minutes.
         </div>
        </>
       )}
      />
     </div> : null}

     {/*<input type='hidden' value={calculateDuration()} name="duration" />*/}
     {initialData ? <input type='hidden' {...register("testId", { value: initialData?.id })} /> : null}

     <div className='w-full space-y-3 flex flex-col'>
      <Label className='text-sm text-left'>Device restrictions</Label>
      <Controller
       name="platform"
       control={control}
       defaultValue={'desktop'}
       render={({ field: { value, onChange } }) => (
        <RadioGroup
         className='flex w-full h-14'
         value={value}
         onValueChange={onChange}
        >
         <div className="flex flex-1 relative">
          <RadioGroupItem
           value="desktop"
           id="desktop"
           className={`hidden ${value === "desktop" ? "border-black absolute left-2 top-[50%] translate-y-[-50%] text-black" : "border-gray-300 text-gray-600 "}`}
          />
          <Label
           htmlFor='desktop'
           className={`cursor-pointer flex items-center p-1 gap-2 border-2 rounded-lg flex-1 justify-center transition-all duration-300 ${value === "desktop" ? "font-bold bg-slate-300 text-black border-black shadow-lg" : "border-gray-300 text-gray-600"}`}
          >
           <Laptop /> Desktop only
          </Label>
         </div>

         <div className="flex flex-1 relative">
          <RadioGroupItem
           value="mobileAndDesktop"
           id="mobileAndDesktop"
           className={`hidden ${value === "mobileAndDesktop" ? "border-black font-bold absolute left-2 top-[50%] translate-y-[-50%] text-black" : "border-gray-300 text-gray-600"}`}
          />
          <Label
           htmlFor='mobileAndDesktop'
           className={`cursor-pointer flex items-center p-1 gap-2 border-2 rounded-lg flex-1 justify-center transition-all duration-300 ${value === "mobileAndDesktop" ? "font-bold bg-slate-300 text-black border-black shadow-lg" : "border-gray-300 text-gray-600"}`}
          >
           <span className='flex'><Smartphone /> <Laptop /></span> Mobile & Desktop
          </Label>
         </div>
        </RadioGroup>
       )}
      />
     </div>

     <Accordion type="single" collapsible className="w-full" value={"advanced-settings"}>
      <AccordionItem value="advanced-settings" className={"border-0"}>
       <AccordionTrigger className='flex items-center justify-center gap-2 [&>svg]:hidden pointer-events-none'>Advanced
        Settings</AccordionTrigger>
       <AccordionContent >
        <div className="space-x-4 flex justify-between">
         <div className="space-y-2">
          <Label className="text-base text-muted-foreground">Test Options</Label>
          <div className="flex flex-col space-y-2">
           <div className="flex items-center gap-2 flex-row-reverse">
            <Label htmlFor="randomize-questions" className="flex-grow">Randomize
             Question Order</Label>
            <Switch
             id="randomize-questions"
             checked={advancedSettings.randomizeQuestions}
             onCheckedChange={(checked) => handleSwitchChange("randomizeQuestions", checked)}
            />
            <input
             type='hidden' {...register('randomizeQuestions', { value: advancedSettings.randomizeQuestions })} />
           </div>
           <div className="flex items-center gap-2 flex-row-reverse">
            <Label htmlFor="show-results" className="flex-grow">Show Results
             Immediately</Label>
            <Switch
             id="show-results"
             checked={advancedSettings.showResultsAfterTest}
             onCheckedChange={(checked) => handleSwitchChange("showResultsAfterTest", checked)}
            />
            <input
             type='hidden' {...register('showResultsAfterTest', { value: advancedSettings.showResultsAfterTest })} />
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
           <div className="flex items-center gap-2 flex-row-reverse">
            <Label htmlFor="disable-copy-paste" className="flex-grow">Disable
             Copy/Paste</Label>
            <Switch
             id="disable-copy-paste"
             checked={advancedSettings.disableCopyPaste}
             onCheckedChange={(checked) => handleSwitchChange("disableCopyPaste", checked)}
            />
            <input
             type='hidden' {...register('disableCopyPaste', { value: advancedSettings.disableCopyPaste })} />
           </div>
           <div className="flex items-center gap-2 flex-row-reverse">
            <Label htmlFor="require-full-screen" className="flex-grow">Require Full
             Screen Mode</Label>
            <Switch
             id="require-full-screen"
             checked={advancedSettings.requireFullScreen}
             onCheckedChange={(checked) => handleSwitchChange("requireFullScreen", checked)}
            />
            <input
             type='hidden' {...register('requireFullScreen', { value: advancedSettings.requireFullScreen })} />
           </div>
          </div>
         </div>
        </div>
       </AccordionContent>
      </AccordionItem>
     </Accordion>
    </CardContent>
    <CardFooter className={cn(`${initialData ? 'p-0 items-end justify-end' : ''}`)}>
     <Button type="submit" className={`${initialData ? "" : "w-full"} mt-2`} disabled={isSubmitting}>
      {isSubmitting ? <Loader className="animate-spin" /> : null}
      {isSubmitting ? `${initialData ? "Editing" : "Creating"} Test` : `${initialData ? "Save changes" : "Create Test"}`}</Button>
    </CardFooter>
   </Card>
  </Form>
 )
}