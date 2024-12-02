'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, CreditCard, Truck, RotateCcw, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Image src="/logo.svg" alt="Petopia" width={40} height={40} />
              <span className="ml-2 text-xl font-bold text-gray-800">Petopia</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone size={16} />
              <span>0-800-123-456</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail size={16} />
              <span>підтримка@petopia.com</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">FAQ</h3>
            <nav className="space-y-2 text-sm">
              <Link href="#" className="block text-gray-600 hover:text-gray-800">Зв'язатися з нами</Link>
              <Link href="#" className="block text-gray-600 hover:text-gray-800">Доставка та повернення</Link>
              <Link href="#" className="block text-gray-600 hover:text-gray-800">Співпраця</Link>
              {/* <Link href="#" className="block text-gray-600 hover:text-gray-800">Про сайт</Link> */}
            </nav>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Наші гарантії</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <CreditCard size={20} />
                <span>Безпечні платежі</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Truck size={20} />
                <span>Швидка доставка</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <RotateCcw size={20} />
                <span>Легке повернення</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <HelpCircle size={20} />
                <span>Підтримка 24/7</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div className="mb-4 md:mb-0">
              © {new Date().getFullYear()} Petopia. Усі права захищені.
            </div>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-gray-800">Умови використання</Link>
              {/* <Link href="#" className="hover:text-gray-800">Політика конфіденційності</Link> */}
              {/* <Link href="#" className="hover:text-gray-800">Доступність</Link> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

