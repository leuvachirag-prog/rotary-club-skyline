"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, UserPlus } from "lucide-react";

interface Registration {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "active" | "rejected" | "all">("pending");

  useEffect(() => {
    loadRegistrations();
  }, [filter]);

  const loadRegistrations = async () => {
    try {
      let q;
      if (filter === "all") {
        q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      } else {
        q = query(collection(db, "users"), where("status", "==", filter), orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      setRegistrations(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Registration))
          .filter((r) => r.email)
      );
    } catch (error) {
      console.error("Error loading registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "users", id), { status: "active" });
      await updateDoc(doc(db, "members", id), { status: "active" });
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, status: "active" } : r)));
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "users", id), { status: "rejected" });
      await updateDoc(doc(db, "members", id), { status: "rejected" });
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  const pendingCount = registrations.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Registrations</h1>
          <p className="text-gray-600">Approve or reject new member registrations</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-sm px-3 py-1">{pendingCount} pending</Badge>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {(["pending", "active", "rejected", "all"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "primary" : "outline"} size="sm" onClick={() => { setFilter(f); setLoading(true); }}>
            {f === "pending" && <Clock className="w-3 h-3 mr-1" />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : registrations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No {filter !== "all" ? filter : ""} registrations.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <Card key={reg.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{reg.displayName}</h3>
                      <Badge variant={reg.status === "active" ? "success" : reg.status === "rejected" ? "danger" : "warning"}>
                        {reg.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{reg.email} · {reg.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Registered {new Date(reg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {reg.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(reg.id)}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleReject(reg.id)}>
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                  {reg.status === "rejected" && (
                    <Button size="sm" variant="outline" onClick={() => handleApprove(reg.id)}>
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
