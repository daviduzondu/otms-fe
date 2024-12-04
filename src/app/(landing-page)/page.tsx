import {
    BookA,
    ChartSpline,
    CircleMinus,
    FileLock,
    FileQuestion,
    LucideDices,
    MonitorSmartphone,
    Notebook,
    Plane,
    Share,
    SquareFunction,
    StarHalf,
    Tags,
    Timer,
    Wallpaper,
    Webcam
} from "lucide-react"
import FeatureSection, {TFeatureSection} from "../../components/features-section/feature-section"
import HeroSection from "../../components/hero-section/hero-section"
import Footer from "../../components/footer"
import dynamic from "next/dynamic";

const featureSections: TFeatureSection[] = [
    {
        context: 'Create',
        title: 'Take your assessment game to the next level.',
        description: `Pro tools to help any educator create tests for students at almost any level.`,
        cards: [{
            cardTitle: 'Rich Media Support',
            cardDescription: `Embed images, audio, and videos within questions for interactive assessments.`,
            icon: <Wallpaper size={80} strokeWidth={1.5}/>
        },
            {
                cardTitle: 'Equation Editor',
                cardDescription: `Easily integrate mathematical equations and formulas into question text and answer choices.`,
                icon: <SquareFunction size={80} strokeWidth={1.5}/>
            },
            {
                cardTitle: 'Answer explanations',
                cardDescription: `Provide optional explanations for each answer choice to enhance learning and transparency.`,
                icon: <BookA size={80} strokeWidth={1.5}/>
            },
            {
                cardTitle: 'Question grouping & tagging',
                cardDescription: `Organize questions into categories and subcategories for easy access and reuse.`,
                icon: <Tags size={80} strokeWidth={1.5}/>
            },
        ]
    },
    {
        context: 'Deliver',
        title: 'Get that test anywhere, in perfect condition.',
        description: `You're always in control. Deliver tests, revoke access and more.`,
        cards: [{
            cardTitle: 'Scheduling & time limits',
            cardDescription: `Set specific dates and times for test availability, with countdown timers for realistic test environments.`,
            icon: <Timer size={80} strokeWidth={1.5}/>
        },
            {
                cardTitle: 'Question pool creation',
                cardDescription: `Build a library of questions and organize them into multiple pools for different assessments.`,
                icon: <FileQuestion size={80} strokeWidth={1.5}/>
            },
            {
                cardTitle: 'Multiple device compatiblity',
                cardDescription: `Students can take tests on multiple devices like their desktops, laptops, tablets or smartphones.`,
                icon: <MonitorSmartphone size={80} strokeWidth={1.5}/>
            },
            {
                cardTitle: 'Offline Tests',
                cardDescription: `Some tests are better taken offline. Print tests for offline administration or students with limited internet access.`,
                icon: <Plane size={80} strokeWidth={1.5}/>
            },
        ]
    },
    {
        context: 'Grade & Analyse',
        title: 'Automated grading for MCQs + Result analysis at your fingertips',
        description: `You're always in control. Deliver tests, revoke access and more.`,
        cards: [{
            cardTitle: 'Partial credit options',
            cardDescription: `Award partial credit for partially correct answers, encouraging deeper understanding.`,
            icon: <StarHalf size={80} strokeWidth={1.5}/>
        },
            {
                cardTitle: 'Instant grade reports for MCQs',
                cardDescription: `Students can receive immediate feedback on their performance upon completion of the test.`,
                icon: <Notebook size={80} strokeWidth={1.5}/>
            },
            {
                cardTitle: 'Detailed individual reports',
                cardDescription: `Analyze the performance of each student with question-by-question breakdown, time spent, and more`,
                icon: <ChartSpline size={80} strokeWidth={1.5}/>
            },
            {
                cardTitle: 'Export and share data',
                cardDescription: `Download reports and data in various formats for further analysis and sharing with colleagues or parents.`,
                icon: <Share size={80} strokeWidth={1.5}/>
            },
        ]
    },
    {
        context: 'Secure',
        title: 'Top notch security like never before',
        description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda, vero?`,
        cards: [{
            cardTitle: 'Penalty system',
            cardDescription: `Set automatic deductions for students who lose focus or violate security measures during the test.`,
            icon: <CircleMinus size={80} strokeWidth={1.5}/>
        },
            {
                cardTitle: 'Webcam Monitoring',
                cardDescription: `Optional feature to detect and deter attempts at cheating through external sources.`,
                icon: <Webcam size={80} strokeWidth={1.5}/>
            },
            {
                cardTitle: 'Access controls & restrictions',
                cardDescription: `Define password protection, IP address whitelisting, and device limitations for enhanced security.`,
                icon: <FileLock size={80} strokeWidth={1.5}/>
            },
            {
                cardTitle: 'Random question selection',
                cardDescription: `Choose to have the system randomly select questions from a pool for each student, ensuring unique test experiences.`,
                icon: <LucideDices size={80} strokeWidth={1.5}/>
            }]
    },
]

export default function Home() {
    return <main className={"flex flex-col xl:px-[7em] lg:px-[7em] md:px-[6em] sm:px-[4em] px-[2em] pt-10 pb-4"}>
        <HeroSection/>
        {featureSections.map((f, i) => {
            return <FeatureSection {...f} key={i}/>
        })}
        <Footer/>
    </main>
}