'use client'

import { Button } from "./ui/button"
import { AuthContext } from "../contexts/auth.context"
import { useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserProfileBtn({ className }: { className?: string }) {
 const { user } = useContext(AuthContext);

 return <div>
  <Avatar className={`top-4 right-4 hover:shadow-lg ${className}`}>
   <AvatarImage src={user.photoUrl} />
   <AvatarFallback className='bg-muted-foreground text-white text-sm flex items-center p-3 justify-center'>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
  </Avatar>
 </div>
}