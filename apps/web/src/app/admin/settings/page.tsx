"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Save } from "lucide-react";
import type { ModuleAccess } from "@/store/auth-store";

interface UserRecord {
  id: string;
  displayName: string;
  email: string;
  role: string;
  moduleAccess: ModuleAccess[];
}

const allModules: { key: ModuleAccess; label: string }[] = [
  { key: "membership", label: "Membership" },
  { key: "events_forms", label: "Events & Forms" },
  { key: "transactions", label: "Transactions" },
  { key: "announcements", label: "Announcements" },
  { key: "wishes", label: "Birthday & Wishes" },
  { key: "about_club", label: "About Club" },
  { key: "suggestions", label: "Suggestions" },
  { key: "wall", label: "Wall Posts" },
  { key: "polls", label: "Polls" },
];

export default function SettingsPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editModules, setEditModules] = useState<ModuleAccess[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserRecord)));
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user: UserRecord) => {
    setEditingUser(user.id);
    setEditRole(user.role);
    setEditModules(user.moduleAccess || []);
  };

  const handleSave = async (userId: string) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        role: editRole,
        moduleAccess: editRole === "super_admin" ? allModules.map((m) => m.key) : editModules,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: editRole, moduleAccess: editRole === "super_admin" ? allModules.map((m) => m.key) : editModules }
            : u
        )
      );
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (mod: ModuleAccess) => {
    setEditModules((prev) => (prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]));
  };

  const filtered = users.filter(
    (u) => u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel = (role: string) => {
    if (role === "super_admin") return "Super Admin";
    if (role === "sub_admin") return "Sub Admin";
    return "Member";
  };

  const roleVariant = (role: string) => {
    if (role === "super_admin") return "danger" as const;
    if (role === "sub_admin") return "warning" as const;
    return "default" as const;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage roles and permissions for users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> User Roles & Permissions</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No users found.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        {user.displayName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={roleVariant(user.role)}>{roleLabel(user.role)}</Badge>
                      {editingUser !== user.id && (
                        <Button variant="outline" size="sm" onClick={() => startEditing(user)}>Edit Role</Button>
                      )}
                    </div>
                  </div>

                  {editingUser === user.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="member">Member</option>
                          <option value="sub_admin">Sub Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>

                      {editRole === "sub_admin" && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Module Access</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {allModules.map((mod) => (
                              <label key={mod.key} className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editModules.includes(mod.key)}
                                  onChange={() => toggleModule(mod.key)}
                                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                                />
                                {mod.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSave(user.id)} disabled={saving}>
                          <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
