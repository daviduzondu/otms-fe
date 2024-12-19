
import { QuestionAnswerPage } from "@/components/question-answer-page";
import { addMinutes, isAfter } from "date-fns";

export default async function StudentAnswerPage({ searchParams }) {
 const { token } = searchParams;

 
  if (!token) { throw new Error("You did not provide a token") }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/take/${token}`, {cache: 'no-store'});
  const { data, message} = await response.json();
  
  if (!response.ok) {
   const errorDetails = {
    message,
    statusCode: response.status,
    heading: "Failed to retrieve test",
  };
  throw new Error(JSON.stringify(errorDetails)); // Serialize error details
  }

  if (isAfter(new Date(), addMinutes(new Date(data.startedAt), data.durationMin))) return <div>You&apos;ve run out of time.</div>;
  return <QuestionAnswerPage companyName={"David Uzondu"} data={data} accessToken={token} />
}