"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { Users, FileText, IndianRupee, Megaphone, Cake, MessageSquare, ImageIcon, BarChart3 } from "lucide-react";

const stats = [
  { label: "Total Members", value: "400", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Forms", value: "5", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
  { label: "This Month Revenue", value: "₹25,000", icon: IndianRupee, color: "text-yellow-600", bg: "bg-yellow-50" },
  { label: "Announcements", value: "3", icon: Megaphone, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Upcoming Birthdays", value: "12", icon: Cake, color: "text-pink-600", bg: "bg-pink-50" },
  { label: "Pending Suggestions", value: "7", icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Pending Wall Posts", value: "4", icon: ImageIcon, color: "text-teal-600", bg: "bg-teal-50" },
  { label: "Active Polls", value: "2", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.displayName || "Admin"}
        </h1>
        <p className="text-gray-600 mt-1">Rotary Club of Ahmedabad Skyline — Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 py-5">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">No recent members to show yet.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">No upcoming events.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
