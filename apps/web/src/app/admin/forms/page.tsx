"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Eye, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FormDef {
  id: string;
  title: string;
  description: string;
  type: string;
  status: "active" | "inactive";
  fields: unknown[];
  responseCount: number;
  createdAt: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormDef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const q = query(collection(db, "forms"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        responseCount: 0,
        ...doc.data(),
      })) as FormDef[];
      setForms(data);
    } catch (error) {
      console.error("Error loading forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? All responses will also be deleted.")) return;
    try {
      await deleteDoc(doc(db, "forms", id));
      setForms((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  };

  const copyFormLink = (id: string) => {
    const url = `${window.location.origin}/forms/${id}`;
    navigator.clipboard.writeText(url);
    alert("Form link copied!");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events & Forms</h1>
          <p className="text-gray-600">Create and manage forms for events, registration, surveys</p>
        </div>
        <Link href="/admin/forms/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Form
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No forms created yet.</p>
            <Link href="/admin/forms/create">
              <Button><Plus className="w-4 h-4 mr-2" /> Create Your First Form</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{form.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{form.description}</p>
                  </div>
                  <Badge variant={form.status === "active" ? "success" : "default"}>
                    {form.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{form.fields?.length || 0} fields</span>
                  <span>{form.responseCount} responses</span>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/forms/${form.id}/responses`}>
                    <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                  </Link>
                  <Link href={`/admin/forms/${form.id}/edit`}>
                    <Button variant="ghost" size="sm"><Edit2 className="w-4 h-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => copyFormLink(form.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <a href={`/forms/${form.id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(form.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
