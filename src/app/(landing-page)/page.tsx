import { BookA, SquareFunction, Tags, Wallpaper } from "lucide-react"
import FeatureSection, { TFeatureSection } from "../../components/features-section/feature-section"
import HeroSection from "../../components/hero-section/hero-section"

const featureSections: TFeatureSection[] = [
 {
  context: 'Create', title: 'Take your assessment game to the next level.', description: `Pro tools to help any educator create tests for students at almost any level.`,
  cards: [{
   cardTitle: 'Rich Media Support',
   cardDescription: `Embed images, audio, and videos within test questions for interactive assessments.`,
   icon: <Wallpaper size={80} strokeWidth={1.5} />
  },
  {
   cardTitle: 'Equation Editor',
   cardDescription: `Easily integrate mathematical equations and formulas into question text and answer choices.`,
   icon: <SquareFunction size={80} strokeWidth={1.5} />
  },
  {
   cardTitle: 'Answer explanations',
   cardDescription: `Provide optional explanations for each answer choice to enhance learning and transparency.`,
   icon: <BookA size={80} strokeWidth={1.5} />
  },
  {
   cardTitle: 'Question grouping and tagging',
   cardDescription: `Organize questions into categories and subcategories for easy access and reuse.`,
   icon: <Tags size={80} strokeWidth={1.5} />
  },
  ]
 },
]

export default function Home() {
 return <main className={"flex flex-col gap-24"}>
  <HeroSection />
  {featureSections.map((f, i) => { return <FeatureSection {...f} key={i} /> })}

 </main>
}