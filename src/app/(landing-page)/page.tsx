'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, BarChart3, Book, Calendar, Clock, FileText, ImageIcon, Lock, MonitorPlay, MoveUpRight, PenSquare, Settings2, Shield, Sparkles, UserPlus } from 'lucide-react'
import { Badge } from "../../components/ui/badge"
import ActionButtons from "../../components/hero-section/action-buttons"

export default function Home() {
 return (
  <div className="flex flex-col min-h-screen">
   <main className="flex-1">
    <section className="w-full py-12 md:pt-24 lg:pt-28 pt-20 border-b relative">
     <div
      className="absolute inset-0 bg-grid-pattern -z-10 pointer-events-none"
      style={{ backgroundSize: '30px 30px' }}
     >
      <div
       id="mask"
       className="absolute inset-0 bg-gradient-radial from-white via-white/90 to-transparent pointer-events-none transition-opacity"
      ></div>
     </div>
     <div className="container flex flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
      <div className="space-y-3">
       <Badge variant="secondary" className="rounded-md px-3 py-1 mb-5 text-[0.9rem]">
        Revolutionizing Classroom assessments
       </Badge>
       <h1 className="text-5xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-[5.5rem]">
        Your All-In-One Platform to{" "}<br />
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
         Create, Deliver & Grade
        </span>
        <br />
        Tests for Students, Effectively.
       </h1>
       <p className="mx-auto max-w-[800px] text-gray-500 text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
        The most comprehensive testing platform designed for educators. <br /> Create, manage, and grade
        tests with powerful features and seamless experience.
       </p>
      </div>
      <div className="flex flex-col gap-2 mt-3 min-[400px]:flex-row">
       <ActionButtons />
      </div>
     </div>
    </section>
    <section className="w-full py-12 md:py-24 lg:py-32">
     <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
       <div className="space-y-2">
        <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
         Features
        </div>
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything you need to manage tests</h2>
        <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
         This OTMS provides all the tools you need to create, deliver, and grade tests effectively.
        </p>
       </div>
      </div>
      <div className="grid gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3">
       <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg border bg-background p-6"
       >
        <div className="flex gap-4">
         <ImageIcon className="h-6 w-6 text-blue-500" />
         <h3 className="font-semibold">Rich Media Support</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
         Embed images, audio, and videos within questions for interactive assessments.
        </p>
       </motion.div>
       <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg border bg-background p-6"
       >
        <div className="flex gap-4">
         <PenSquare className="h-6 w-6 text-purple-500" />
         <h3 className="font-semibold">Equation Editor</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
         Easily integrate mathematical equations and formulas into test questions.
        </p>
       </motion.div>
       <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg border bg-background p-6"
       >
        <div className="flex gap-4">
         <Sparkles className="h-6 w-6 text-pink-500" />
         <h3 className="font-semibold">Effortless Test Delivery</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
         Generate test links or email tests to students directly. Access is restricted to authorized participants.
        </p>
       </motion.div>

       <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg border bg-background p-6"
       >
        <div className="flex gap-4">
         <Clock className="h-6 w-6 text-green-500" />
         <h3 className="font-semibold">Time Limits</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
         Set time-limited tests with countdown timers. The timer continues running even if a student leaves the page.
        </p>
       </motion.div>
       <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg border bg-background p-6"
       >
        <div className="flex gap-4">
         <MonitorPlay className="h-6 w-6 text-yellow-500" />
         <h3 className="font-semibold">Multiple Device Compatibility</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
         Students can take tests on multiple devices like their desktops, laptops, tablets or smartphones.
        </p>
       </motion.div>
       <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg border bg-background p-6"
       >
        <div className="flex gap-4">
         <FileText className="h-6 w-6 text-red-500" />
         <h3 className="font-semibold">Offline Tests</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
         Some tests are better taken offline. Print tests for offline administration or students with limited internet access.
        </p>
       </motion.div>
       <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg border bg-background p-6"
       >
        <div className="flex gap-4">
         <BarChart3 className="h-6 w-6 text-indigo-500" />
         <h3 className="font-semibold">Detailed Analytics</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
         Get comprehensive insights into student performance with detailed analytics and reporting tools.
        </p>
       </motion.div>
       <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg border bg-background p-6"
       >
        <div className="flex gap-4">
         <Settings2 className="h-6 w-6 text-orange-500" />
         <h3 className="font-semibold">Automated Grading</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
         Save time with automatic grading for multiple choice questions and instant feedback for students.
        </p>
       </motion.div>
       <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg border bg-background p-6"
       >
        <div className="flex gap-4">
         <Shield className="h-6 w-6 text-teal-500" />
         <h3 className="font-semibold">Advanced Security</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
         Ensure test integrity with features like webcam monitoring and random question selection.
        </p>
       </motion.div>
      </div>
     </div>
    </section>
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
     <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
       <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Start creating tests today</h2>
        <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
         Join the educators who are already using this platform to create better assessments.
        </p>
       </div>
       <div className="flex flex-col gap-2 min-[400px]:flex-row">
        <ActionButtons />
       </div>
      </div>
     </div>
    </section>
   </main>
   <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
    <p className="text-xs text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} OTMS. All rights reserved. Final year project by David Uzondu</p>
   </footer>
  </div>
 )
}