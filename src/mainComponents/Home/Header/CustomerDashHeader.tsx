import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Settings,
  User,
  LogOut,
  Home,
  Wrench,
  FileText,
  Phone,
  User2Icon,
} from "lucide-react";
import { Link } from "react-router-dom";

export function CustomerDashHeader() {
  const [notifications] = useState(3); // Mock notification count

  return (
    <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Dashboard Title */}
          <div className='flex items-center space-x-4'>
            <Link to='/' className='flex items-center space-x-2'>
              <span className='font-bold text-xl text-red-500'>
                Tsangpool Honda
              </span>
            </Link>
            <div className='hidden md:block h-6 w-px bg-gray-300' />
          </div>

          {/* Navigation Links */}
          <nav className='hidden md:flex items-center space-x-6'>
            <Link to='/dashboard' className='text-red-600 font-medium'>
              Dashboard
            </Link>
            <Link
              to='/dashboard/services'
              className='text-gray-600 hover:text-red-600 transition-colors'
            >
              Services
            </Link>
            <Link
              to='/dashboard/documents'
              className='text-gray-600 hover:text-red-600 transition-colors'
            >
              Documents
            </Link>
            <Link
              to='/contact'
              className='text-gray-600 hover:text-red-600 transition-colors'
            >
              Support
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className='flex items-center space-x-4'>
            {/* Notifications */}
            <Button variant='ghost' size='sm' className='relative'>
              <Bell className='h-5 w-5' />
              {notifications > 0 && (
                <Badge className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600'>
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Quick Actions */}
            <div className='hidden sm:flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                className='text-red-600 border-red-600 hover:bg-red-50 bg-transparent'
              >
                <Wrench className='h-4 w-4 mr-1' />
                <Link to='/book-service'>Book Service</Link>
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-10 w-10 rounded-full bg-gray-200'
                >
                  <User2Icon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      Ilix Hazarika
                    </p>
                    <p className='text-xs leading-none text-muted-foreground'>
                      ilixHazarika@email.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className='mr-2 h-4 w-4' />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className='mr-2 h-4 w-4' />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className='mr-2 h-4 w-4' />
                  <span>Documents</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Home className='mr-2 h-4 w-4' />
                  <Link to='/'>Back to Website</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-red-600'>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className='md:hidden border-t border-gray-200 bg-gray-50'>
        <div className='px-4 py-2'>
          <div className='flex justify-around'>
            <Link
              to='/dashboard'
              className='flex flex-col items-center py-2 text-red-600'
            >
              <Home className='h-5 w-5' />
              <span className='text-xs mt-1'>Dashboard</span>
            </Link>
            <Link
              to='/dashboard/services'
              className='flex flex-col items-center py-2 text-gray-600'
            >
              <Wrench className='h-5 w-5' />
              <span className='text-xs mt-1'>Services</span>
            </Link>
            <Link
              to='/dashboard/documents'
              className='flex flex-col items-center py-2 text-gray-600'
            >
              <FileText className='h-5 w-5' />
              <span className='text-xs mt-1'>Documents</span>
            </Link>
            <Link
              to='/contact'
              className='flex flex-col items-center py-2 text-gray-600'
            >
              <Phone className='h-5 w-5' />
              <span className='text-xs mt-1'>Support</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
