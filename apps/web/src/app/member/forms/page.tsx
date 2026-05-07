"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FormDef {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  fields: unknown[];
}

export default function MemberFormsPage() {
  const [forms, setForms] = useState<FormDef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const q = query(collection(db, "forms"), where("status", "==", "active"));
      const snapshot = await getDocs(q);
      setForms(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FormDef)));
    } catch (error) {
      console.error("Error loading forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "registration": return "bg-blue-50 text-blue-700";
      case "event": return "bg-green-50 text-green-700";
      case "survey": return "bg-purple-50 text-purple-700";
      case "feedback": return "bg-orange-50 text-orange-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Forms</h1>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No forms available right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{form.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${typeColor(form.type)}`}>
                        {form.type}
                      </span>
                    </div>
                    {form.description && <p className="text-sm text-gray-600">{form.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{form.fields?.length || 0} questions</p>
                  </div>
                  <Link href={`/forms/${form.id}`}>
                    <Button size="sm">
                      Fill Form <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
