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
import { errorToast, successToast } from '../../../../helpers/show-toasts'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateTestSchema, CreateTestSchemaProps } from '../../../../validation/create-test.validation'
import { useRouter } from 'next/navigation';
import { Slider } from '../../../../components/ui/slider'
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group'
import { Laptop, Smartphone } from 'lucide-react'

export default function CreateTestClient() {
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
 } = useForm<CreateTestSchemaProps>({ resolver: zodResolver(CreateTestSchema) })
 const [advancedSettings, setAdvancedSettings] = useState({
  maxAttempts: 1,
  randomizeQuestions: false,
  showResultsAfterTest: false,
  preventTabSwitching: false,
  disableCopyPaste: false,
  requireFullScreen: false,
  provideExplanations: false,
 })



 const RequiredAsterisk = () => <span className="text-red-500">*</span>

 const handleSwitchChange = (fieldName: keyof CreateTestSchemaProps, value: boolean) => {
  setAdvancedSettings((prevSettings) => ({ ...prevSettings, [fieldName]: value }));
  setValue(fieldName, value); // Update form state with setValue
 };

 useEffect(() => {
  setValue('durationMin', 30)
 }, [])

 return (
  <Form className="w-full max-w-3xl flex items-center pb-4 justify-center" control={control}
   action={`${process.env.NEXT_PUBLIC_API_URL}/api/tests/create`} headers={{
    "Content-Type": "application/json",
    "Authorization": `Bearer ${user?.accessToken}`
   }}
   onSuccess={async ({ response }) => {
    const { data } = await response.json();
    router.replace(`/test/${data.id}`)
    successToast("Test created successfully")
   }}
   onError={async (e) => errorToast((await e.response?.json())?.message || "Network error")}
   method="post">
   <Card className={"lg:min-w-[40vw] h-full flex flex-col"}>
    <CardHeader>
     <CardTitle className="text-xl font-bold">Create New Test</CardTitle>
     <CardDescription>Set up your new test parameters</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6 flex-1">
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

     <div className="space-y-3">
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
     </div>

     {/*<input type='hidden' value={calculateDuration()} name="duration" />*/}

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
         <div className="flex flex-1">
          <RadioGroupItem
           value="desktop"
           id="desktop"
           className={`hidden ${value === "desktop" ? "border-green-600 font-bold text-green-600" : "border-gray-300"}`}
          />
          <Label
           htmlFor='desktop'
           className={`cursor-pointer flex items-center p-1 gap-2 border-2 rounded-lg flex-1 justify-center ${value === "desktop" ? "bg-green-50 text-green-600 border-green-600" : "border-gray-300"}`}
          >
           <Laptop /> Desktop only
          </Label>
         </div>

         <div className="flex flex-1 relative">
          <RadioGroupItem
           value="mobileAndDesktop"
           id="mobileAndDesktop"
           className={`absolute right-0 ${value === "mobileAndDesktop" ? "border-green-600 font-bold text-green-600" : "border-gray-300"}`}
          />
          <Label
           htmlFor='mobileAndDesktop'
           className={`cursor-pointer flex items-center p-1 gap-2 border-2 rounded-lg flex-1 justify-center ${value === "mobileAndDesktop" ? "bg-green-50 text-green-600 border-green-600" : "border-gray-300"}`}
          >
           <span className='flex'><Smartphone /> <Laptop /></span> Mobile & Desktop
          </Label>
         </div>
        </RadioGroup>
       )}
      />
     </div>




     <Accordion type="single" collapsible className="w-full" value={"advanced-settings"}>
      <AccordionItem value="advanced-settings">
       <AccordionTrigger className='flex items-center justify-center gap-2'>Advanced
        Settings</AccordionTrigger>
       <AccordionContent>
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
             onCheckedChange={(checked) => setAdvancedSettings({
              ...advancedSettings,
              showResultsAfterTest: checked
             })}
            />
            <input
             type='hidden' {...register('showResultsAfterTest', { value: advancedSettings.showResultsAfterTest })} />
           </div>
          </div>
          <div className="flex flex-col space-y-2">
           {/* <div className="flex items-center gap-2 flex-row-reverse">
                                                <Label htmlFor="show-correct-answers" className="flex-grow">Show Correct
                                                    Answers</Label>
                                                <Switch
                                                    id="show-correct-answers"
                                                    checked={advancedSettings.showCorrectAnswers}
                                                    onCheckedChange={(checked) => handleSwitchChange("showCorrectAnswers", checked)}
                                                />
                                                <input
                                                    type='hidden' {...register('showCorrectAnswers', {value: advancedSettings.showCorrectAnswers})} />
                                            </div> */}
           <div className="flex items-center gap-2 flex-row-reverse">
            <Label htmlFor="provide-explanations" className="flex-grow">Provide
             Explanations</Label>
            <Switch
             id="provide-explanations"
             checked={advancedSettings.provideExplanations}
             onCheckedChange={(checked) => handleSwitchChange("provideExplanations", checked)}
            />
            <input
             type='hidden' {...register('provideExplanations', { value: advancedSettings.provideExplanations })} />
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
    <CardFooter>
     <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? "Creating Test" : "Create Test"}</Button>
    </CardFooter>
   </Card>
  </Form>
 )
}