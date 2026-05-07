"use client";

import { useState, useEffect, use } from "react";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

interface FormField {
  id: string;
  label: string;
  type: string;
}

interface Submission {
  id: string;
  responses: Record<string, string | string[]>;
  submittedByName: string;
  submittedAt: string;
}

export default function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [formTitle, setFormTitle] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const formDoc = await getDoc(doc(db, "forms", id));
      if (formDoc.exists()) {
        const data = formDoc.data();
        setFormTitle(data.title);
        setFields(data.fields || []);
      }

      const q = query(collection(db, "formSubmissions"), where("formId", "==", id), orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);
      setSubmissions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Submission)));
    } catch (error) {
      console.error("Error loading responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Submitted By", "Date", ...fields.map((f) => f.label)];
    const rows = submissions.map((s) => [
      s.submittedByName,
      new Date(s.submittedAt).toLocaleDateString("en-IN"),
      ...fields.map((f) => {
        const val = s.responses[f.id];
        return Array.isArray(val) ? val.join(", ") : (val || "");
      }),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formTitle}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/forms">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{formTitle} — Responses</h1>
          <p className="text-gray-600">{submissions.length} responses</p>
        </div>
        {submissions.length > 0 && (
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : submissions.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-gray-500">No responses yet.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Submitted By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    {fields.map((f) => (
                      <th key={f.id} className="text-left py-3 px-4 font-medium text-gray-600">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{s.submittedByName}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(s.submittedAt).toLocaleDateString("en-IN")}</td>
                      {fields.map((f) => {
                        const val = s.responses[f.id];
                        const display = Array.isArray(val) ? val.join(", ") : (val || "—");
                        const isURL = typeof display === "string" && display.startsWith("http");
                        return (
                          <td key={f.id} className="py-3 px-4 text-gray-600 max-w-xs truncate">
                            {isURL ? <a href={display} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View File</a> : display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
