
import { QuestionAnswerPage } from "@/components/question-answer-page";
import { addMinutes, isAfter } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "../../../../components/ui/card";
import { BookCheck, Clock } from "lucide-react";

export default async function Page({ searchParams }) {
 const { token } = searchParams;


 if (!token) { throw new Error("You did not provide a token") }

 const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/take/${token}`, { cache: 'no-store' });
 const { data, message } = await response.json();

 console.log(data);

 if (!response.ok) {
  const errorDetails = {
   message,
   statusCode: response.status,
   heading: "Failed to retrieve test",
  };
  throw new Error(JSON.stringify(errorDetails)); // Serialize error details
 }

 if (data.status === "submitted") return <div className={"flex items-center justify-center h-screen"}><ErrorCard icon={<BookCheck size={40}/>} content="Whoops! Looks like you&apos;ve already made a submission." footer={"If you think this is wrong, contact your supervisor."}/></div>


 if (isAfter(new Date(), addMinutes(new Date(data.startedAt), data.durationMin))) return <div className={"flex items-center justify-center h-screen"}><ErrorCard icon={<Clock size={40}/>} content="You've run out of time." footer={"If you think this is wrong, contact your supervisor."}/></div>;
 return <QuestionAnswerPage companyName={"David Uzondu"} data={data} accessToken={token} />
}


function ErrorCard({icon, content, footer} : {icon: React.ReactNode, content: string, footer: string}) {
 return <Card className="lg:w-[25vw] w-screen">
  <CardHeader className="flex">{icon}</CardHeader>
  <CardContent className="font-bold text-lg -mt-3">
   {content}
  </CardContent>
  <CardFooter className="text-sm -mt-2">{footer}</CardFooter>
 </Card>
}