
import { QuestionAnswerPage } from "@/components/test/question-answer-page";
import { addMinutes, isAfter } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "../../../../components/ui/card";
import { Ban, BookCheck, BookOpenCheck, Clock, Laptop, RectangleEllipsis, Shield } from "lucide-react";
import TokenRequestCard from "../../../../components/test/token-request-card";
import BeforeTest from "../../../../components/test/before-proceeding";
import { TestDetails } from "../../../../types/test";
import { ErrorBoundary } from "react-error-boundary";
import LocalErrorFallback from "../../../../components/errors/local-error-fallback";
import GlobalErrorFallback from "../../../../components/errors/global-error-fallback";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import { Button } from "../../../../components/ui/button";
import ResultsDialog from "../../../../components/test/results-dialog";

type Student = { id: string, email: string, regNumber: string, firstName: string, lastName: string, middleName: string, addedBy: string, isTouched: boolean, testInfo: TestDetails, resultReady: Boolean }

async function verifyStudent(token: string) {
 const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/verify-student`, {
  cache: 'no-store', headers: {
   'x-access-token': token
  }
 });

 const { data, message }: { data: Student, message: string } = await response.json();
 if (!response.ok) throw new Error(message || "Something went wrong");
 return data;
}


export default async function Page({ searchParams, params }) {
 try {
  const { code } = params
  const { token, ri } = searchParams;
  const { device } = userAgent({ headers: headers() });

  if (!token) return <div className={"flex items-center justify-center h-screen"}><TokenRequestCard code={code} /></div>

  const studentData = await verifyStudent(token);


  if (!ri && !studentData.isTouched) return <BeforeTest studentName={`${studentData.firstName} ${studentData.lastName}`} testDetails={studentData.testInfo} />

  if (device.type === 'mobile' && studentData.testInfo.platform === 'desktop') return <div className={"flex items-center justify-center h-screen"}><ErrorCard icon={<Ban size={40} />} content="Sorry, you cannot access this test on this device." footer={"Switch to Desktop and try again."} /></div>

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/take/${token}`, { cache: 'no-store' });
  const { data, message } = await response.json();


  if (!response.ok) {
   const errorDetails = {
    message,
    statusCode: response.status,
    heading: "Failed to retrieve test",
   };
   throw new Error(JSON.stringify(errorDetails)); // Serialize error details
  }


  if (data.status === "submitted" || isAfter(new Date(), addMinutes(new Date(data.startedAt), data.durationMin))) return <div className={"flex items-center justify-center h-screen"}><ErrorCard icon={!studentData.resultReady ? <BookCheck size={40} /> : <BookOpenCheck size={40} />} content={!studentData.resultReady ? "Looks like you've already made a submission." : "Your results are ready"} footer={!studentData.resultReady ? "This test was submitted, either by you or automatically after time expired. If you think this is wrong, contact your supervisor." : "You're seeing this because you've made a submission. If you think this is wrong, contact your supervisor."} resultReady={studentData.resultReady} accessToken={token} testId={studentData.testInfo.id} /></div>

  if (studentData.testInfo.isRevoked && !studentData.isTouched) return <div className={"flex items-center justify-center h-screen"}><ErrorCard icon={<Ban size={40} />} content="Sorry, this test is not accepting responses at this time." footer={"If you think this is wrong, contact your supervisor."} /></div>


  // if (isAfter(new Date(), addMinutes(new Date(data.startedAt), data.durationMin))) return <div className={"flex items-center justify-center h-screen"}><ErrorCard icon={<Clock size={40} />} content="You've run out of time." footer={"If you think this is wrong, contact your supervisor."} /></div>;
  return <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
   <QuestionAnswerPage companyName={""} data={data} accessToken={token} resultReady={studentData.resultReady} disableCopyPaste={studentData.testInfo.disableCopyPaste} />
  </ErrorBoundary>
 } catch (error) {
  return <div className={"flex items-center justify-center h-screen"}><ErrorCard icon={<Shield size={40} />} content={(error as Error).message} footer={"Please try again or contact your supervisor."} /></div>
 }
}



function ErrorCard({ icon, content, footer, resultReady, testId, accessToken }: { icon: React.ReactNode, content: string, footer: string, resultReady?: Boolean, accessToken?: string, testId?: string }) {
 return <Card className="lg:w-[25vw] w-screen">
  <CardHeader className="flex">{icon}</CardHeader>
  <CardContent className="font-bold text-lg -mt-3">
   {content}
  </CardContent>
  <CardFooter className="text-sm -mt-2 flex flex-col w-full gap-3 text-left items-start">
   {resultReady ?
    <ResultsDialog accessToken={accessToken!} testId={testId!} />
    : null}{footer}
  </CardFooter>
 </Card>
}