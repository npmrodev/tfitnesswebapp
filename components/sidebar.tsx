'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  QrCode, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

type SidebarItem = {
  icon: React.ReactNode
  label: string
  href: string
  allowedRoles: string[]
}

export function Sidebar({ userRole = 'member' }: { userRole?: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const sidebarItems: SidebarItem[] = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      href: '/dashboard',
      allowedRoles: ['owner', 'staff', 'member'],
    },
    {
      icon: <Users size={20} />,
      label: 'Members',
      href: '/members',
      allowedRoles: ['owner', 'staff'],
    },
    {
      icon: <CreditCard size={20} />,
      label: 'Memberships',
      href: '/memberships',
      allowedRoles: ['owner', 'staff'],
    },
    {
      icon: <QrCode size={20} />,
      label: 'Check-In',
      href: '/checkin',
      allowedRoles: ['owner', 'staff'],
    },
    {
      icon: <FileText size={20} />,
      label: 'Reports',
      href: '/reports',
      allowedRoles: ['owner'],
    },
    {
      icon: <FileText size={20} />,
      label: 'Audit Logs',
      href: '/audit-logs',
      allowedRoles: ['owner'],
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      href: '/settings',
      allowedRoles: ['owner'],
    },
  ]

  const filteredItems = sidebarItems.filter(item => item.allowedRoles.includes(userRole))

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = '/sign-in'
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-primary text-primary-foreground p-2 border border-primary hover:bg-primary/90"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground leading-tight">
                T-FITNESS
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Gym Management</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="px-4 py-2 text-xs text-sidebar-foreground/60">
            <p className="font-medium">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 border border-sidebar-border transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content margin */}
      <div className="md:ml-64" />
    </>
  )
}
