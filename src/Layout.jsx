import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard,
  Ticket,
  Monitor,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  DoorOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  Bell,
  Search,
  User,
  ShieldCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard', color: 'text-blue-500' },
  { 
    name: 'Service IT',
    icon: Ticket,
    color: 'text-emerald-500',
    submenu: [
      { name: 'Tickets', page: 'Tickets' },
      { name: 'Actifs IT', page: 'Assets' },
      { name: 'Topologie réseau', page: 'NetworkTopology' },
      { name: 'Base de connaissances', page: 'Knowledge' },
    ]
  },
  {
    name: 'Ressources Humaines',
    icon: Users,
    color: 'text-violet-500',
    submenu: [
      { name: 'Employés', page: 'Employees' },
      { name: 'Offres d\'emploi', page: 'JobPostings' },
      { name: 'Candidatures', page: 'Applications' },
    ]
  },
  { name: 'Comptabilité', icon: FileText, page: 'Accounting', color: 'text-amber-500' },
  { name: 'Contrôle d\'accès', icon: DoorOpen, page: 'AccessControl', color: 'text-rose-500' },
  { name: 'Gestion utilisateurs', icon: ShieldCheck, page: 'UserManagement', color: 'text-red-500', adminOnly: true },
  { name: 'Paramètres', icon: Settings, page: 'Settings', color: 'text-slate-500' },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isActive = (page) => currentPageName === page;
  const isSubmenuActive = (submenu) => submenu?.some(item => currentPageName === item.page);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">CORAF</span>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
              {getInitials(user?.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">CORAF</h1>
                <p className="text-xs text-slate-500">ITSM Pro</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-6 right-4 p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {visibleMenuItems.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => setExpandedMenu(expandedMenu === item.name ? null : item.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        isSubmenuActive(item.submenu) 
                          ? "bg-slate-100 text-slate-900" 
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("h-5 w-5", item.color)} />
                        {item.name}
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        expandedMenu === item.name ? "rotate-180" : ""
                      )} />
                    </button>
                    {expandedMenu === item.name && (
                      <div className="ml-12 mt-1 space-y-1">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.page}
                            to={createPageUrl(subitem.page)}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "block px-4 py-2 rounded-lg text-sm transition-all",
                              isActive(subitem.page)
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={createPageUrl(item.page)}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive(item.page)
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", item.color)} />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-slate-200">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900">{user?.full_name || 'Utilisateur'}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.role || 'client'} {user?.department ? `· ${user.department}` : ''}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => base44.auth.logout()}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">{currentPageName}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}