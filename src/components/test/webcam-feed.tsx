import React, { useRef, useEffect, useState } from 'react';

interface WebcamFeedProps {
 triggerScreenshot: boolean;
 onScreenshotTaken: (imageSrc: string | null) => void;
 className?: string
 minInterval?: number; // Minimum time between screenshots (ms)
 maxInterval?: number; // Maximum time between screenshots (ms)
}


const WebcamFeed: React.FC<WebcamFeedProps> = ({ className, onScreenshotTaken, minInterval = 3000, maxInterval = 3000 }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    startWebcam();
    scheduleNextScreenshot();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const takeScreenshot = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageSrc = canvas.toDataURL('image/png');
      onScreenshotTaken(imageSrc);
    }
  };

  const getRandomInterval = () => {
    return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
  };

  const scheduleNextScreenshot = () => {
    const nextInterval = getRandomInterval();
    timeoutRef.current = setTimeout(() => {
      takeScreenshot();
      scheduleNextScreenshot();
    }, nextInterval);
  };

  return (
    <div className={className}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-80 rounded-sm bg-black" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default WebcamFeed;
