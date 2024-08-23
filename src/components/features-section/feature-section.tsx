import { Wallpaper } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

export type TCard = { cardTitle: string, cardDescription: string, icon: any };
export type TFeatureSection = { context: string, title: string, description: string | any, cards: TCard[] }

export default function FeatureSection({ context, title, description, cards }: TFeatureSection): React.JSX.Element {
 return (
  <section className={"flex flex-col gap-8"}>
   <div className="flex flex-col gap-3">
    <div className="px-3 py-1 rounded-md bg-gray-200 w-fit select-none mb-2 text-[#3e3c3c]">{context}</div>
    <h2 className={'font-bold text-4xl tracking-tight'}>{title}</h2>
    <div className="text-lg">{description}</div>
   </div>
   <div className={"grid grid-cols-[25%,25%,25%,25%] gap-2"}>
    {cards.map((card, i) => { return <Card {...card} key={i}/> })}
   </div>
  </section>
 )
}

function Card({ cardTitle, cardDescription, icon }: TCard): React.JSX.Element {
 return (<div className="flex flex-col gap-4">
  {icon}
  {/* <Wallpaper size={70} strokeWidth={1.3} /> */}
  <div className="flex flex-col gap-2 break-words">
   <h3 className="text-2xl font-semibold">{cardTitle}</h3>
   <div className="text-base lg:w-[70%] opacity-80">{cardDescription}</div>
  </div>
 </div>)
}