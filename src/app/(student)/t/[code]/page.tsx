
import { QuestionAnswerPage } from "@/components/test/question-answer-page";
import { addMinutes, isAfter } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "../../../../components/ui/card";
import { BookCheck, Clock, RectangleEllipsis, Shield } from "lucide-react";
import TokenRequestCard from "../../../../components/test/token-request-card";
import BeforeTest from "../../../../components/test/before-proceeding";
import { TestDetails } from "../../../../types/test";

type Student = { id: string, email: string, regNumber: string, firstName: string, lastName: string, middleName: string, addedBy: string, isTouched: boolean, testInfo: TestDetails }

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
 const { code } = params
 const { token, ri } = searchParams;

 if (!token) return <div className={"flex items-center justify-center h-screen"}><TokenRequestCard code={code} /></div>
 const studentData = await verifyStudent(token);

 if (!ri && !studentData.isTouched) <BeforeTest studentName={`${studentData.firstName} ${studentData.lastName}`} testDetails={studentData.testInfo} />

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

 // if (data.status === "submitted" || isAfter(new Date(), addMinutes(new Date(data.startedAt), data.durationMin))) return <div className={"flex items-center justify-center h-screen"}><ErrorCard icon={<BookCheck size={40} />} content="Whoops! Looks like you&apos;ve already made a submission." footer={"This test was submitted, either by you or automatically after time expired. Contact your supervisor for assistance."} /></div>


 // if (isAfter(new Date(), addMinutes(new Date(data.startedAt), data.durationMin))) return <div className={"flex items-center justify-center h-screen"}><ErrorCard icon={<Clock size={40} />} content="You've run out of time." footer={"If you think this is wrong, contact your supervisor."} /></div>;
 return <QuestionAnswerPage companyName={""} data={data} accessToken={token} />
}



function ErrorCard({ icon, content, footer }: { icon: React.ReactNode, content: string, footer: string }) {
 return <Card className="lg:w-[25vw] w-screen">
  <CardHeader className="flex">{icon}</CardHeader>
  <CardContent className="font-bold text-lg -mt-3">
   {content}
  </CardContent>
  <CardFooter className="text-sm -mt-2">{footer}</CardFooter>
 </Card>
}