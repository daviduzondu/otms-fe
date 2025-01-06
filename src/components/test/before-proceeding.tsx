'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation";
import { TestDetails } from "../../types/test";
import { GraduationCap, WebcamIcon, CameraOff } from "lucide-react";
import Webcam from 'react-webcam';
import { useEffect, useState } from "react";

interface WelcomePageProps {
 studentName?: string;
 testDetails: TestDetails;
}

export default function BeforeTest({
 studentName: userName = "David",
 testDetails
}: WelcomePageProps) {

 const router = useRouter();
 const searchParams = useSearchParams();
 const [cameraError, setCameraError] = useState(true);

 const addSearchParam = () => {
  const params = new URLSearchParams(searchParams);
  params.set('ri', 'true');

  router.push(`?${params.toString()}`);
 };

 return (
  <div className="min-h-screen p-4 flex hide-footer-brand items-center justify-center">
   <div className="max-w-7xl mx-auto">
    <header className="absolute left-0 top-5 flex items-center justify-center w-screen">
     <span className="font-plex flex gap-2 text-xl items-center justify-center">
      <GraduationCap /> ONLINE TEST MANAGEMENT SYSTEM
     </span>
    </header>

    <Card className="mt-8 p-8 shadow-sm">
     <CardContent className="p-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
       {/* Left Column */}
       <div className="space-y-6">
        <h2 className="text-2xl font-medium">
         Hello, <span className="font-normal">{userName}</span>
        </h2>
        <div className="space-y-4 text-gray-600">
         <p>
          You're about to start your test.
         </p>
         <WebcamFeed cameraError={cameraError} setCameraError={setCameraError} />
        </div>
       </div>

       {/* Right Column */}
       <div className="space-y-6">
        <h3 className="text-lg font-medium">A few things before you start:</h3>
        <ul className="space-y-4 text-gray-600">
         <li>
          Please ensure your <strong>camera/webcam is enabled</strong>
          {testDetails.requireFullScreen ? <strong> and remain in full-screen mode</strong> : ""}. Periodic snapshots may be taken during the test to maintain fairness.
         </li>
         <li>
          Turn on your <strong>speakers or headphones</strong> for audio playback, if required.
         </li>
         <li>
          This test is <strong>timed</strong>, and a timer will be displayed either per test or per question.
         </li>
         <li>
          Be aware that the timer <strong>starts immediately</strong>, including during any preview questions.
         </li>
         <li>
          The test will take approximately <strong>{testDetails.durationMin} minutes</strong> to complete.
         </li>
         <li>
          We recommend <strong>completing the test in one sitting</strong> without interruptions. If you leave the test, the timer will still be running.
         </li>
         <li>
          When you're ready to start, click the <strong>Take me to test</strong> button. Good luck!
         </li>
        </ul>
       </div>
      </div>

      <div className="mt-8 flex justify-end">
       {<Button
        onClick={addSearchParam}
        disabled={cameraError}
        title={cameraError ? "You cannot proceed without granting access to your camera" : ''}
       >
        Take me to test
       </Button>}
      </div>
     </CardContent>
    </Card>
   </div>
  </div>
 )
}

function WebcamFeed({ cameraError, setCameraError }) {
 const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | null>(null);

 useEffect(() => {
  const checkPermissions = async () => {
   try {
    const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
    setPermissionStatus(status.state);

    if (status.state === 'granted') setCameraError(false);

    status.onchange = () => {
     setPermissionStatus(status.state);
    };
   } catch (error) {
    console.warn('Permissions API not supported:', error);
   }
  };

  checkPermissions();
 }, []);

 const handleCameraError = (error: Error) => {
  console.error('Webcam error:', error.message);
  setCameraError(true);
 };

 const requestPermission = () => {
  // Try to access the camera again
  navigator.mediaDevices
   .getUserMedia({ video: true })
   .then(() => {
    setCameraError(false);
    setPermissionStatus('granted');
   })
   .catch((err) => {
    console.error('Permission request failed:', err);
   });
 };

 return (
  <div className="space-y-2 bg-slate-200 p-2 rounded">
   <div className="flex space-x-2 text-sm items-center justify-start">
    <WebcamIcon className="h-5 w-5" />
    <span>Webcam Feed</span>
    {!cameraError ? <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></span> : null}
   </div>

   {permissionStatus === 'denied' || cameraError ? (
    <div className="flex flex-col items-center justify-center w-full h-80 bg-red-100 rounded-sm space-y-2">
     <CameraOff className="h-6 w-6 text-red-500" />
     <span className="text-red-500">Webcam access is blocked.</span>
     <p className="text-xs text-gray-500 mt-2">
      Adjust your browser settings, then click "Retry"
     </p>
     <Button
      onClick={requestPermission}
      className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md"
     >
      Retry
     </Button>
    </div>
   ) : (
    <Webcam
     className="bg-black w-full h-80 rounded-sm"
     audio={false}
     mirrored={true}
     disablePictureInPicture={true}
     onUserMediaError={handleCameraError}
    />
   )}
  </div>
 );
}