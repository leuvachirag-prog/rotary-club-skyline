"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, IndianRupee } from "lucide-react";

interface Transaction {
  id: string;
  memberName: string;
  memberId: string;
  type: "dues" | "donation" | "event" | "other";
  amount: number;
  description: string;
  date: string;
  status: "paid" | "pending";
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    memberName: "",
    memberId: "",
    type: "dues" as Transaction["type"],
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    status: "paid" as Transaction["status"],
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const q = query(collection(db, "transactions"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)));
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, amount: Number(form.amount), createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, "transactions"), data);
      setTransactions((prev) => [{ id: docRef.id, ...data } as Transaction, ...prev]);
      setForm({ memberName: "", memberId: "", type: "dues", amount: "", description: "", date: new Date().toISOString().split("T")[0], status: "paid" });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteDoc(doc(db, "transactions", id));
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const filtered = transactions.filter(
    (t) => t.memberName?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = transactions.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const totalPending = transactions.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage dues, donations, and payments</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">₹{totalPending.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Transaction</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="memberName" label="Member Name *" value={form.memberName} onChange={(e) => setForm((p) => ({ ...p, memberName: e.target.value }))} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Transaction["type"] }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="dues">Membership Dues</option>
                  <option value="donation">Donation</option>
                  <option value="event">Event Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input id="amount" label="Amount (₹) *" type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
              <Input id="date" label="Date *" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
              <Input id="description" label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Transaction["status"] }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Transaction"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle>All Transactions</CardTitle>
            <Input placeholder="Search by member or description..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-72" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Member</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{t.memberName}</td>
                      <td className="py-3 px-4 capitalize">{t.type}</td>
                      <td className="py-3 px-4 flex items-center gap-1"><IndianRupee className="w-3 h-3" />{t.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 px-4"><Badge variant={t.status === "paid" ? "success" : "warning"}>{t.status}</Badge></td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
