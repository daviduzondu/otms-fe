'use client'

import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Link} from "next-view-transitions"
import {useForm} from "react-hook-form"
import {LoginSchema, LoginSchemaProps} from "../../../../validation/auth.validation"
import {zodResolver} from "@hookform/resolvers/zod"
import {signIn} from "next-auth/react"
import {errorToast, successToast} from "../../../../helpers/show-toasts"
import {useRouter, useSearchParams} from "next/navigation"
import {useContext, useState} from "react"
import {AuthContext} from "../../../../contexts/auth.context"
import SignOutBeforeProceeding from "../../../../components/auth/sign-out-before-proceeding"
import {AlertTriangleIcon} from "lucide-react";

export default function LoginClient() {
    const {user} = useContext(AuthContext);
    const next = useSearchParams().get('next');
    const router = useRouter();
    const {
        register,
        formState: {errors},
        getValues,
        handleSubmit
    } = useForm<LoginSchemaProps>({resolver: zodResolver(LoginSchema)});
    const [submitting, setSubmitting] = useState(false)

    if (user) return <SignOutBeforeProceeding/>

    const loginHandler = async () => {
        setSubmitting(true)
        const res = await signIn("credentials", {
            redirect: false,
            email: getValues().email,
            password: getValues().password,
        });
        console.log(res)

        if (res?.error) {
            errorToast("Failed to login", {description: res?.error})
        } else {
            successToast("Welcome back " + getValues().email);
            router.replace(next ? next : "/dashboard");
        }
        setSubmitting(false)
    };

    return (
        <form onSubmit={handleSubmit(loginHandler)}>
            {next ? (
                <div
                    className={'bg-red-100 text-sm p-3 w-1/4 flex gap-2 items-center justify-center text-left rounded-lg text-red-600 border-red-600 border-2 fixed top-28 left-1/2 transform -translate-x-1/2'}>
                    <AlertTriangleIcon size={17}/>
                    Access blocked. You must login before proceeding.
                </div>
            ) : null}
            <div className="space-y-2 text-center" style={{viewTransitionName: "auth-main-header"}}>
                <h1 className="text-3xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground">Login to your account</p>
            </div>
            <div>
                <div className="space-y-3">
                    <div className="space-y-2" style={{viewTransitionName: "input-email"}}>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" placeholder="m@example.com" type="email" {...register("email")} />
                        {errors?.email && <div className="text-xs text-red-700">{errors.email.message}</div>}
                    </div>
                    <div className="space-y-2" style={{viewTransitionName: "input-password"}}>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password"
                               placeholder="Enter a strong password" {...register("password")} />
                        {errors?.password && <div className="text-xs text-red-700">{errors.password.message}</div>}
                    </div>
                    <Button type="submit" className="w-full" style={{viewTransitionName: "action-btn"}}
                            disabled={submitting}>
                        {submitting ? "Logging in..." : "Login"}
                    </Button>
                </div>
                <div className="mt-4 text-center text-sm ">
                    Don&apos;t have an account?{" "}
                    <Link href={`/auth/register`} className="hover:underline text-blue-600" prefetch={false}>
                        Register
                    </Link>
                </div>
            </div>
        </form>
    )
}