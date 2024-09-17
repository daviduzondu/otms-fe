import { ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useContext } from "react"
import ActionButtons from "./action-buttons"
import dashboard from "@/assets/dashboard.png"

export default function HeroSection(): React.JSX.Element {
 return <div className="flex flex-col gap-11 overflow-hidden h-[93.8vh]">
  <div className={`font-plex text-[3rem] lg:text-[4.5rem]
  tracking-tight leading-[1em] mt-8`}>

   <div className="absolute w-full h-full left-0 top-0 -z-20">
    <div className="mask-rect absolute inset-0 bg-[url('https://cal.com/_next/static/media/grid.cf5386be.svg')] bg-contain"></div>
   </div>

   Your All-In-One Platform to <br />
   <span className="gradient-text">
    <span>Create</span>,{" "}
    <span>Deliver</span> &{" "}
    <span>Grade</span><br />
   </span>
   Tests For Students. Effectively.
  </div>

  <ActionButtons />

  <Image
   className="w-full object-cover border-solid border-8 rounded-3xl border-black drop-shadow-2xl select-none"
   draggable={false}
   src={dashboard}
   alt="Feature Image"
   width={800}
   height={600}
   priority
   unoptimized
  />

 </div>
}