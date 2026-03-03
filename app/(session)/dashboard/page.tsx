import {
  Bell,
  ChevronDown,
  Home,
  LineChart,
  Menu,
  MessageSquare,
  PlusIcon,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <h1 className="font-bold text-4xl">Welcome to KitaKita!</h1>
      <h6 className="text-sm font-light mt-6">Create Your board</h6>
      <div className="mt-2">
        <Link href={"/dashboard/board"}>
          <button className="border-primary border py-2 px-6 text-primary rounded-lg font-normal text-sm flex items-center gap-2 mb-2">
            <PlusIcon className="size-4" /> Create Board
          </button>
        </Link>
      </div>
    </div>
  );
}
