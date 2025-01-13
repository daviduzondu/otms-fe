'use client'
import React, { useContext } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { AuthContext } from '@/contexts/auth.context';
import { TailSpin } from 'react-loader-spinner'
import { signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { GraduationCap } from 'lucide-react';

export default function Navbar(): React.JSX.Element {
 const { user, authLoading } = useContext(AuthContext);
 return (
  <nav className="flex justify-between items-center left-0 px-5 py-2 top-0 bg-[#ffffff63] border-b-2 border-dashed border-bottom-black backdrop-blur-lg z-10 fixed w-full">
      <Link href="/" className={`font-plex text-2xl font-semibold flex gap-2 items-center`}><GraduationCap size={30} /> ONLINE TEST MANAGEMENT SYSTEM</Link>

   <div className="flex gap-3 items-center">
    {
     user !== null && (authLoading === "authenticated") ?
      <>
       {/* <Button className='h-8 text-sm'>
        Continue to Dashboard
       </Button> */}
       {user.email}
       <Avatar>
        <AvatarImage src={user.photoURL} />
        <AvatarFallback className='bg-muted-foreground text-white flex items-center justify-center'>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
       </Avatar>
       <Button className='h-8 text-sm' variant={'destructive'} onClick={() => signOut()}>
        Sign Out
       </Button>
       {/* <img src={`${user.photoURL}`} className='rounded-full' width={30} height={30} alt="" /> */}
      </> : authLoading === "loading" && <TailSpin
       visible={true}
       strokeWidth={5}
       height="30"
       width="30"
       color="#174bc3"
       ariaLabel="tail-spin-loading"
       radius="1"
       wrapperStyle={{}}
       wrapperClass="" />
    }
   </div>
  </nav >
 );
}
