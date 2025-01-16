'use client'
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Link} from "next-view-transitions"
import {RegSchema, RegSchemaProps} from '../../../../validation/auth.validation';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form, useForm} from "react-hook-form";
import {useContext, useEffect, useState} from "react"
import {ZodError} from "zod"
import {CheckCircle2Icon} from "lucide-react"
import {useRouter, useSearchParams} from "next/navigation"
import {errorToast, successToast} from "../../../../helpers/show-toasts"
import {AuthContext} from "../../../../contexts/auth.context"
import SignOutBeforeProceeding from "../../../../components/auth/sign-out-before-proceeding"

export default function RegisterClient() {
    const {user} = useContext(AuthContext);
    const next = useSearchParams().get('next');

    const {
        register,
        watch,
        control,
        formState: {errors, isSubmitting},
    } = useForm<RegSchemaProps>({resolver: zodResolver(RegSchema)});
    const [satisfied, setSatisfied] = useState<string[]>([]);
    const passwordChecklist = RegSchema._def.schema.shape.password._def.checks.map(x => x.message) as Array<string>
    const router = useRouter();

    useEffect(() => {
        const subscription = watch(({password}, {name}) => {
            if (name === "password") {
                try {
                    RegSchema._def.schema.shape.password.parse(password);
                    setSatisfied(passwordChecklist);
                } catch (error: unknown) {
                    if (error instanceof ZodError) {
                        setSatisfied(passwordChecklist.filter(x => !(JSON.parse(error.message) as Array<Record<string, string>>)
                            .map(msg => msg.message)
                            .includes(x as string)
                        ));
                    }
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    if (user) return <SignOutBeforeProceeding/>

    return (
        <Form
            action={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`}
            headers={{
                "Content-Type": "application/json"
            }}
            method="post"
            control={control}
            onError={async ({response}) => {
                errorToast((await response?.json()).message)
            }}
            onSuccess={() => {
                successToast("Registration successful, you will soon be redirected to login")
                router.replace("/auth/login")
            }}
        >
            <div className="space-y-2 text-center" style={{viewTransitionName: "auth-main-header"}}>
                <h1 className="text-3xl font-bold">Create an Account</h1>
                <p className="text-muted-foreground">Sign up to start using this amazing software</p>
            </div>
            <div className="mt-4">
                <div className="space-y-3">
                    <div className="flex lg:flex-row flex-col gap-3">
                        <div className="space-y-2 max-h-48 transition-all">
                            <Label htmlFor="name">First Name</Label>
                            <Input id="name" placeholder="John Doe" {...register("firstName")} />
                            {errors?.firstName &&
                                <div className="text-xs text-red-700">{errors.firstName.message}</div>}
                        </div>
                        <div className="space-y-2 max-h-48 transition-all">
                            <Label htmlFor="name">Last Name</Label>
                            <Input id="name" placeholder="John Doe" {...register("lastName")} />
                            {errors?.lastName && <div className="text-xs text-red-700">{errors.lastName.message}</div>}
                        </div>
                    </div>
                    <div className="space-y-2" style={{viewTransitionName: "input-email"}}>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                        {errors?.email && <div className="text-xs text-red-700">{errors.email.message}</div>}
                    </div>
                    <div className="space-y-2" style={{viewTransitionName: "input-password"}}>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password"
                               placeholder="Enter a strong password" {...register("password")} />
                        {errors?.password &&
                            <div className="text-xs text-red-700">{"Password does not meet all the requirements"}</div>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password"
                               placeholder="Confirm Password" {...register("confirmPassword")} />
                        {errors?.confirmPassword &&
                            <div className="text-xs text-red-700">{errors.confirmPassword?.message}</div>}
                    </div>
                    <div className="py-3 flex flex-col gap-1">
                        {passwordChecklist.map(msg => {
                            return <div
                                className={`${satisfied.includes(msg) ? "text-green-700 font-bold" : "text-gray-600"} text-xs flex items-center gap-2 min-h-fit`}
                                key={msg}>
                                <div>
                                    <CheckCircle2Icon size={17} strokeWidth={2.5}/>
                                </div>
                                {msg}</div>
                        })}
                    </div>
                    <Button type="submit" className="w-full" style={{viewTransitionName: "action-btn"}}
                            disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Create Account"}
                    </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href={"/auth/login"} className="hover:underline text-blue-600" prefetch={false}>
                        Login
                    </Link>
                </div>
            </div>
        </Form>
    );
}
