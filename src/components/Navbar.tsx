'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from './theme-toggle'
import { 
  Kanban, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Monitor,
  CheckSquare,
  CreditCard
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface NavbarProps {
  user?: {
    id: string
    email: string
    name?: string
  } | null
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const { setTheme } = useTheme()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  const getUserDisplayName = () => {
    if (user?.name) return user.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Kanban className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-foreground">Retro Boards</span>
            </Link>
          </div>

          {/* Center - Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/dashboard') 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
            
            <button 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1 opacity-50 cursor-not-allowed"
              disabled
            >
              <CheckSquare className="h-4 w-4" />
              <span>Action Items</span>
            </button>
            
            <button 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1 opacity-50 cursor-not-allowed"
              disabled
            >
              <CreditCard className="h-4 w-4" />
              <span>Subscription</span>
            </button>
          </div>

          {/* Right side - User Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  {/* Theme Options */}
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
                    <Link href="/api/auth/logout" className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/api/auth/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 