'use client'
import React, { useContext, useEffect, useState } from 'react';
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
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowBlur(true);
      } else {
        setShowBlur(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`flex justify-between items-center left-0 px-5 py-2 top-0 border-bottom-black transition-all duration-300 ${showBlur ? 'backdrop-blur-md bg-[#ffffff49] border-b' : ''} z-10 fixed w-full`}>
      <Link
        href="/"
        className="font-plex text-lg font-semibold flex gap-2 items-center lg:hidden"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-75 blur-xl animate-gradient" />
          <GraduationCap size={33} className="text-white relative rounded-full p-1 bg-gradient-to-r from-purple-400/80 via-pink-500/80 to-red-500/80 backdrop-blur-sm" />
        </div> OTMS
      </Link>
      <Link
        href="/"
        className="font-plex text-lg font-semibold gap-2 items-center hidden lg:flex"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-75 blur-xl" />
          <GraduationCap size={33} className="text-white relative rounded-full p-1 bg-gradient-to-r from-purple-400/80 via-pink-500/80 to-red-500/80 backdrop-blur-sm" />
        </div> ONLINE TEST MANAGEMENT SYSTEM
      </Link>

      <div className="flex gap-3 items-center">
        {
          user !== null && (authLoading === "authenticated") ?
            <>
              <Avatar>
                <AvatarFallback className='bg-muted-foreground text-white flex items-center justify-center'>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
              </Avatar>
              <Button className='h-8 text-sm' variant={'outline'} onClick={() => (confirm('Are you sure?') && signOut())}>
                Sign Out
              </Button>
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
    </nav>
  );
}
