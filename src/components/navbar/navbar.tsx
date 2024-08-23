import React from 'react';
import { Button } from '../ui/button';

export default function Navbar(): React.JSX.Element {
 return (
  <nav className="flex justify-between items-center left-0 px-5 py-2 top-0 bg-[#ffffffc2] border-b-2 border-dashed border-bottom-black backdrop-blur-xl z-10 absolute w-full">
   <div className="text-black text-xl font-semibold font-plex">
    [:ONLINE TEST MANAGEMENT SYSTEM:]
   </div>
   <div className="flex space-x-4">
    <Button className='h-8 text-sm'>
     Continue to Dashboard
    </Button>
   </div>
  </nav>
 );
}
