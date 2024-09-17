import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../../config/firebase/firebase.config";
import { LoginResponse } from "../../../../types/auth";

export async function handleUserLogin(credentials: any) {
 try {
  const res = await fetch(
   `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
   {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     email: credentials?.email,
     password: credentials?.password,
    }),
   }
  );

  const user = (await res.json()) as LoginResponse;

  if (res.ok && user && user.accessToken) {
   return user;
  }

  return null;
 } catch (error) {
  console.error("Login error: ", error);
  return null;
 }
}

export async function registerUser({ email, firstName, lastName, password }: { email: string, firstName: string, lastName: string, password: string }) {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, firstName, lastName, password })
 })
 const json = await res.json()
 if (res.status !== 201) throw new Error(json.message)
}

export async function continueWithGoogle() {
 const provider = new GoogleAuthProvider();

 try {
  await signInWithPopup(auth, provider);
 } catch (error) {
  console.error('Error during Google sign-in:', error);
 }
}