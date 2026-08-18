import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  Sparkles,
  Table2,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/data";
import { Button } from "@/components/ui/button";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/syllabus", label: "Syllabus", icon: BookOpen },
  { to: "/tracking", label: "Tracking", icon: Table2 },
  { to: "/daily", label: "Daily 360R", icon: ListChecks },
  { to: "/revision", label: "Revision", icon: RefreshCw },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ai", label: "Personal AI", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_NAV = NAV_ITEMS.slice(0, 5);

export function useSignOut() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const signOut = useSignOut();

  useEffect(() => {
    if (profile && !profile.onboarded && pathname !== "/onboarding") {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profile, pathname, navigate]);

  useEffect(() => setDrawer(false), [pathname]);

  if (pathname === "/onboarding") return <>{children}</>;

  const current = NAV_ITEMS.find((n) => pathname.startsWith(n.to));

  const navList = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith(item.to)
              ? "bg-sidebar-accent text-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
          )}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Link to="/dashboard" className="mb-6 flex items-center gap-2 px-1">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-warm text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          <span className="font-display text-base font-semibold">StudyTracker</span>
        </Link>
        {navList}
        <div className="mt-auto space-y-3">
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
            <p className="truncate text-sm font-medium">{profile?.name || "Student"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {[profile?.class, profile?.exam].filter(Boolean).join(" · ") || "Set up your profile"}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="size-4" /> Log out
          </Button>
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:hidden">
        <span className="font-display font-semibold">{current?.label ?? "StudyTracker"}</span>
        <button onClick={() => setDrawer(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 38 }}
            className="absolute inset-y-0 right-0 flex w-72 flex-col border-l border-sidebar-border bg-sidebar p-4"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display font-semibold">Menu</span>
              <button onClick={() => setDrawer(false)} aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            {navList}
            <Button variant="ghost" size="sm" className="mt-auto justify-start" onClick={signOut}>
              <LogOut className="size-4" /> Log out
            </Button>
          </motion.div>
        </div>
      )}

      <main className="pb-24 lg:pb-10 lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
              pathname.startsWith(item.to) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-lofi flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/12 text-primary">
        <Icon className="size-6" />
      </span>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}