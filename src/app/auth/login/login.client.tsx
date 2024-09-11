'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "next-view-transitions"
import { useForm } from "react-hook-form"
import { LoginSchema, LoginSchemaProps } from "../../../validation/auth.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "../../../contexts/auth.context"
import firebaseApp from "../../../config/firebase/firebase.config"
import { getAuth } from "firebase/auth"


export default function LoginClient() {
 const { user } = useContext(AuthContext);
 const { register, handleSubmit, formState: { errors } } = useForm<LoginSchemaProps>({ resolver: zodResolver(LoginSchema) });
 const router = useRouter();

 // useEffect(() => {
 //  if (user) router.push('/')
 // })

 async function handleLogin() {
  const req = await fetch(String(process.env.NEXT_PUBLIC_API_URL), {
   method: "GET",
   headers: {
    'Authorization': `Bearer ${await user?.getIdToken()}`
   }
  })
  const data = await req.text()
  console.log(data)
 }

 return (
  <form onSubmit={handleSubmit(handleLogin)}>
   <div className="space-y-2 text-center" style={{ viewTransitionName: "auth-main-header" }}>
    <h1 className="text-3xl font-bold">Welcome Back</h1>
    <p className="text-muted-foreground">Login to your account</p>
   </div>
   <div>
    <div className="space-y-3">
     <div className="space-y-2" style={{ viewTransitionName: "input-email" }}>
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="m@example.com" type="email" {...register("email")} />
      {errors?.email && <div className="text-xs text-red-700">{errors.email.message}</div>}
     </div>
     <div className="space-y-2" style={{ viewTransitionName: "input-password" }}>
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" placeholder="Enter a strong password" {...register("password")} />
      {errors?.password && <div className="text-xs text-red-700">{errors.password.message}</div>}
     </div>
     <Button type="submit" className="w-full" style={{ viewTransitionName: "action-btn" }}>
      Login
     </Button>
    </div>
    <div className="mt-4 text-center text-sm">
     Don&apos;t have an account?{" "}
     <Link href="/auth/register" className="hover:underline" prefetch={false} >
      Register
     </Link>
    </div>
   </div>
  </form>
 )
}