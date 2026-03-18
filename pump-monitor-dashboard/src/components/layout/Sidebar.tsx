import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Settings,
  Gauge,
  Brain,
  BarChart3,
  Calendar,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { to: "/", icon: LayoutDashboard, label: "Overview" },
  { to: "/insights", icon: Brain, label: "AI Insights", badge: "AI" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/planner", icon: Calendar, label: "Maintenance Planner" },
];

const assetNavItems: NavItem[] = [
  { to: "/pumps", icon: Gauge, label: "Asset Details" },
  { to: "/alerts", icon: AlertTriangle, label: "Alerts" },
];

const knowledgeNavItems: NavItem[] = [
  { to: "/failure-intelligence", icon: BookOpen, label: "Failure Library" },
];

function NavSection({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card/50 backdrop-blur-xl">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <div className="rounded-xl bg-primary/20 p-2">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold">PumpMonitor</span>
            <span className="text-[10px] text-muted-foreground">
              Reliability OS v2.0
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-6 p-4 overflow-y-auto no-scrollbar">
          <NavSection title="Intelligence" items={mainNavItems} />
          <NavSection title="Assets" items={assetNavItems} />
          <NavSection title="Knowledge" items={knowledgeNavItems} />
        </nav>

        <div className="border-t p-4 space-y-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
          
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-semibold text-primary">AI Status</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Models active • Last sync 2m ago
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
