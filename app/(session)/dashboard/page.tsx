import {
  Bell,
  ChevronDown,
  Home,
  LineChart,
  Menu,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";

const primaryNavigation = [
  { label: "Overview", icon: Home, href: "#" },
  { label: "Team", icon: Users, href: "#" },
  { label: "Feedback", icon: MessageSquare, href: "#" },
  { label: "Performance", icon: LineChart, href: "#" },
] as const;

const headerNav = [
  {
    label: "Feedback",
    href: "#",
  },
  {
    label: "Roadmap",
    href: "#",
  },
  {
    label: "Users",
    href: "#",
  },
];

const secondaryNavigation = [
  { label: "Settings", icon: Settings, href: "#" },
] as const;

const quickStats = [
  { label: "Active Feedback", value: "28", trend: "+12% vs last week" },
  { label: "Team Score", value: "4.6 / 5", trend: "Consistent performance" },
  { label: "Pending Actions", value: "7", trend: "Resolve within 3 days" },
] as const;

const recentUpdates = [
  {
    title: "Quarterly review prepared",
    description: "Leadership team shared highlights for Q4.",
    time: "2 hours ago",
  },
  {
    title: "New feedback template",
    description: "Design squad introduced a sprint wrap-up form.",
    time: "Yesterday",
  },
  {
    title: "Team sentiment",
    description: "Overall morale increased after town hall.",
    time: "2 days ago",
  },
] as const;

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <h1 className="font-bold text-4xl">Welcome to KitaKita!</h1>
    </div>
  );
}
