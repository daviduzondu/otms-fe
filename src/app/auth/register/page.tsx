import { Metadata } from "next";
import RegisterClient from "./register.client"

export const metadata: Metadata = {
 title: 'Register',
 description: 'Sign up to start using this amazing software',
};
export default function Register() {
 return <RegisterClient />
}