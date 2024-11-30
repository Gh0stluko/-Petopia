'use client';
import Link from 'next/link';
import Image from 'next/image';
export default function Footer() {
return(
    
<footer className="bg-gray-100">
<div className="container mx-auto px-4 py-8">
  <div className="flex flex-col md:flex-row justify-between items-center">
    <div className="flex items-center mb-4 md:mb-0">
      <Image src="/logo.svg" alt="Petopia" width={40} height={40} />
      <span className="ml-2 text-xl font-bold text-gray-800">Petopia</span>
    </div>
    <nav className="flex flex-wrap justify-center md:justify-end gap-4">
      <Link href="#" className="text-gray-600 hover:text-gray-800">About Us</Link>
      <Link href="#" className="text-gray-600 hover:text-gray-800">Contact</Link>
      <Link href="#" className="text-gray-600 hover:text-gray-800">Terms of Service</Link>
      <Link href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</Link>
    </nav>
  </div>
  <div className="mt-8 text-center text-gray-500 text-sm">
    © {new Date().getFullYear()} Petopia. All rights reserved.
  </div>
</div>
</footer>
)}