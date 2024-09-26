'use client'

import Link from "next/link"
import { Button } from "./ui/button"
import { AuthContext } from "../contexts/auth.context"
import { useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserProfileBtn() {
 const { user } = useContext(AuthContext);
 
 return <Link href="/me">
  <Avatar className="fixed top-4 right-4 hover:shadow-lg">
   <AvatarImage src={user.photoUrl} />
   <AvatarFallback className='bg-muted-foreground text-white text-sm flex items-center p-3  justify-center'>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
  </Avatar>
 </Link>
}