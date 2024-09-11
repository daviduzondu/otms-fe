'use client'
import React, { useContext } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { AuthContext } from '@/contexts/auth.context';
import { signOut } from '../../app/auth/utils/authentication';
import { TailSpin } from 'react-loader-spinner'

export default function Navbar(): React.JSX.Element {
 const { user, authLoading } = useContext(AuthContext);

 return (
  <nav className="flex justify-between items-center left-0 px-5 py-2 top-0 bg-[#ffffff63] border-b-2 border-dashed border-bottom-black backdrop-blur-lg z-10 fixed w-full">
   <Link href={"/"}>
    <div className="text-black text-xl font-semibold font-plex">
     [:ONLINE TEST MANAGEMENT SYSTEM:]
    </div>
   </Link>
   <div className="flex space-x-4">
    {
     user !== null && !authLoading ?
      <>
       <Button className='h-8 text-sm'>
        Continue to Dashboard
       </Button>
       <Button className='h-8 text-sm' variant={'destructive'} onClick={signOut}>
        Sign Out
       </Button>
       <img src={`${user.photoURL}`} className='rounded-full' width={30} height={30} alt="" />
      </> : authLoading && <TailSpin
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
