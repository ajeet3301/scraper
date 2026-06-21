"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, FolderOpen, FlaskConical, Settings, Bug,
  ChevronLeft, ChevronRight, LogOut, Moon, Sun, Bell, ChevronDown, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Button } from "@/components/ui/index";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
  { href: "/dashboard/playground", icon: FlaskConical, label: "API Playground" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

interface Props {
  children: React.ReactNode;
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null };
}

export function DashboardShell({ children, user }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const NavLink = ({ item }: { item: typeof navItems[0] }) => (
    <Link href={item.href} onClick={() => setMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive(item.href, item.exact)
          ? "bg-indigo-600 text-white"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && item.label}
    </Link>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative z-50 flex flex-col h-full border-r border-border bg-card transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-60",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className={cn("flex items-center gap-2 px-4 h-16 border-b border-border", collapsed && "justify-center")}>
          <div className="h-8 w-8 shrink-0 rounded-lg gradient-brand flex items-center justify-center">
            <Bug className="h-4 w-4 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-sm truncate">Universal Scraper</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => <NavLink key={item.href} item={item} />)}
        </nav>

        {/* Collapse button (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background items-center justify-center hover:bg-accent transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-accent" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
              <Moon className="h-4 w-4 absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
            </button>
            <button className="p-2 rounded-lg hover:bg-accent transition-colors"><Bell className="h-4 w-4" /></button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.image ?? ""} />
                    <AvatarFallback className="text-xs gradient-brand text-white">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{user.name ?? user.email}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard/settings" className="cursor-pointer"><Settings className="h-4 w-4 mr-2" />Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4 mr-2" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
