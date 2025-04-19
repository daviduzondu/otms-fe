import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { handleUserLogin } from "../../../(landing-page)/auth/utils/authentication";

export const authOptions: NextAuthOptions = {
 providers: [
  CredentialsProvider({
   name: "Email and Password",
   credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" },
   },
   async authorize(credentials) {
    return await handleUserLogin(credentials);
   },
  }),
 ],
 callbacks: {
  async jwt({ token, user }) {
   // console.log(token)
   // If user is returned on login, attach user data to token
   if (user) {
    console.log(user)
    Object.assign(token, user)
   }
   return token;
  },
  async session({ session, token, }) {
   // Attach token data to session
   Object.assign(session, { user: token })
   // console.log(session)
   return session;
  },
 },
 session: {
  strategy: "jwt",
  maxAge: 2419200
 },
 pages: {
  signIn: "/auth/login", // Custom login page
 },
 secret: process.env.NEXTAUTH_SECRET,
};

// Fix: ensure both GET and POST methods are properly handled
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
