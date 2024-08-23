import { ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"

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

  <div className="flex flex-col gap-6">
   <Button className="w-fit lg:text-lg lg:py-6 font-normal group relative flex items-center shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
    Create an account
    <ArrowRight
     className="ml-2 w-5 transition-all duration-100 ease-in-out group-hover:ml-[0.8rem] group-hover:w-5 group-hover:opacity-100"
    />
   </Button>

   <span className="font-semibold flex gap-1 lg:text-xl text-base">Already have an account?
    <button className="group flex text-blue-600 hover:underline hover:underline-offset-1 items-center justify-center">
     Login
     <ArrowRight
      size={20}
      className="-ml-1 w-6 opacity-0 transition-all duration-100 ease-in-out group-hover:ml-[0.1rem] group-hover:w-6 group-hover:opacity-100"
     />
    </button>
   </span>
  </div>

  <img
   className="w-full object-cover border-solid border-8 rounded-3xl border-black drop-shadow-2xl"
   src="https://cal.com/_next/static/media/feature-01.2d7d8eea.svg"
   alt="Feature Image"
  />

 </div>
}