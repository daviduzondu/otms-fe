import { Metadata } from "next"
import LoginClient from "./login.client"
import { headers } from "next/headers";

export const metadata: Metadata = {
 title: 'Login',
 description: 'Login to your account',
};

export default function Login() {
 const referer = headers().get('referer');

 return <LoginClient callback={referer} />
}