'use client'
import React, { useContext } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { AuthContext } from '@/contexts/auth.context';
import { TailSpin } from 'react-loader-spinner'
import { signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { GraduationCap } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function Navbar(): React.JSX.Element {
 const { user, authLoading } = useContext(AuthContext);
 return (
  <nav className="flex justify-between items-center left-0 px-5 py-2 top-0 bg-[#ffffff63] border-b-2 border-dashed border-bottom-black backdrop-blur-lg z-10 fixed w-full"><Link
   href="/"
   className="font-plex text-lg font-semibold flex gap-2 items-center lg:hidden"
  >
   <div className="relative">
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-75 blur-xl animate-gradient" />
    <div className="relative rounded-full p-2 bg-gradient-to-r from-purple-400/80 via-pink-500/80 to-red-500/80 backdrop-blur-sm animate-gradient">
     <GraduationCap size={28} className="text-white" />
    </div>
    <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
   </div> OTMS
  </Link>
   <Link
    href="/"
    className="font-plex text-lg font-semibold gap-2 items-center hidden lg:flex"
   >
    <div className="relative">
     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-75 blur-xl animate-gradient" />
     <div className="relative rounded-full p-2 bg-gradient-to-r from-purple-400/80 via-pink-500/80 to-red-500/80 backdrop-blur-sm animate-gradient">
      <GraduationCap size={28} className="text-white" />
     </div>
     <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div> ONLINE TEST MANAGEMENT SYSTEM
   </Link>

   <div className="flex gap-3 items-center">
    {
     user !== null && (authLoading === "authenticated") ?
      <>
       {/* <Button className='h-8 text-sm'>
        Continue to Dashboard
       </Button> */}
       <Badge variant={'secondary'} className="hidden lg:block">
        {user.email.replace(/(.{5}).+(@.+)/, '$1***$2')}
       </Badge>

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
