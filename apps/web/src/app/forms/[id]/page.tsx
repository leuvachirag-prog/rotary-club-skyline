"use client";

import { useState, useEffect, use } from "react";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { CheckCircle } from "lucide-react";

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  options: string[];
}

interface FormDef {
  title: string;
  description: string;
  type: string;
  status: string;
  fields: FormField[];
}

export default function FillFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const [form, setForm] = useState<FormDef | null>(null);
  const [responses, setResponses] = useState<Record<string, string | string[] | File>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadForm();
  }, [id]);

  const loadForm = async () => {
    try {
      const docSnap = await getDoc(doc(db, "forms", id));
      if (docSnap.exists()) {
        setForm(docSnap.data() as FormDef);
      }
    } catch (error) {
      console.error("Error loading form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldId: string, value: string | string[] | File) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const current = (responses[fieldId] as string[]) || [];
    const updated = checked ? [...current, option] : current.filter((o) => o !== option);
    setResponses((prev) => ({ ...prev, [fieldId]: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const processedResponses: Record<string, unknown> = {};
      for (const [fieldId, value] of Object.entries(responses)) {
        if (value instanceof File) {
          const storageRef = ref(storage, `form-uploads/${id}/${Date.now()}_${value.name}`);
          await uploadBytes(storageRef, value);
          processedResponses[fieldId] = await getDownloadURL(storageRef);
        } else {
          processedResponses[fieldId] = value;
        }
      }

      await addDoc(collection(db, "formSubmissions"), {
        formId: id,
        responses: processedResponses,
        submittedBy: user?.uid || "anonymous",
        submittedByName: user?.displayName || "Anonymous",
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Form not found.</p>
      </div>
    );
  }

  if (form.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">This form is no longer accepting responses.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">Your response has been submitted successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">RC</span>
          </div>
          <p className="text-sm text-gray-500">Rotary Club of Ahmedabad Skyline</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            {form.description && <p className="text-sm text-gray-600 mt-1">{form.description}</p>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {form.fields.map((field) => (
                <div key={field.id}>
                  {(field.type === "text" || field.type === "email" || field.type === "phone" || field.type === "number" || field.type === "date") && (
                    <Input
                      id={field.id}
                      label={`${field.label}${field.required ? " *" : ""}`}
                      type={field.type === "phone" ? "tel" : field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === "textarea" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}{field.required ? " *" : ""}
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                        placeholder={field.placeholder}
                        required={field.required}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                      />
                    </div>
                  )}

                  {field.type === "select" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}{field.required ? " *" : ""}
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        required={field.required}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                      >
                        <option value="">Select...</option>
                        {field.options.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {field.type === "radio" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}{field.required ? " *" : ""}
                      </label>
                      <div className="space-y-2">
                        {field.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              required={field.required}
                              onChange={(e) => handleChange(field.id, e.target.value)}
                              className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {field.type === "checkbox" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}{field.required ? " *" : ""}
                      </label>
                      <div className="space-y-2">
                        {field.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              value={opt}
                              onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {(field.type === "file" || field.type === "image") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}{field.required ? " *" : ""}
                      </label>
                      <input
                        type="file"
                        accept={field.type === "image" ? "image/*" : undefined}
                        required={field.required}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChange(field.id, file);
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                  )}
                </div>
              ))}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
