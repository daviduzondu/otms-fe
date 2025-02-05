import { LoginResponse } from "../../../../types/auth";

export async function handleUserLogin(credentials: any) {
 try {
  const operation = await fetch(
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

  const data = (await operation.json()) as LoginResponse;
  if (operation.ok && data && data.accessToken) {
   return data;
  } else {
   throw new Error(data.message);
  }
 } catch (error) {
  console.error(error);
  throw error;
 }
}

export async function registerUser({ email, firstName, lastName, password }: {
 email: string,
 firstName: string,
 lastName: string,
 password: string
}) {
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
