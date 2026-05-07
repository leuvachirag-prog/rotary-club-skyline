"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";

type FieldType = "text" | "email" | "phone" | "number" | "date" | "textarea" | "select" | "checkbox" | "radio" | "file" | "image";

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
  options: string[];
}

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "radio", label: "Radio Buttons" },
  { value: "file", label: "File Upload" },
  { value: "image", label: "Image Upload" },
];

export default function CreateFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formType, setFormType] = useState("general");
  const [fields, setFields] = useState<FormField[]>([]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: `field_${Date.now()}`,
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        options: [],
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex];
    updateField(fieldIndex, { options: [...field.options, ""] });
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const field = fields[fieldIndex];
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldIndex, { options: newOptions });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    updateField(fieldIndex, { options: field.options.filter((_, i) => i !== optionIndex) });
  };

  const hasOptions = (type: FieldType) => ["select", "checkbox", "radio"].includes(type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0) {
      alert("Please add at least one field.");
      return;
    }
    setLoading(true);

    try {
      await addDoc(collection(db, "forms"), {
        title,
        description,
        type: formType,
        fields,
        status: "active",
        createdAt: new Date().toISOString(),
      });
      router.push("/admin/forms");
    } catch (error) {
      console.error("Error creating form:", error);
      alert("Error creating form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/forms">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Form</h1>
          <p className="text-gray-600">Design a form for members to fill</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Form Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input id="title" label="Form Title *" placeholder="e.g., Event Registration Form" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Describe the purpose of this form..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="registration">Registration</option>
                <option value="event">Event</option>
                <option value="survey">Survey</option>
                <option value="feedback">Feedback</option>
                <option value="general">General</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Form Fields ({fields.length})</CardTitle>
              <Button type="button" onClick={addField}>
                <Plus className="w-4 h-4 mr-2" /> Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No fields added yet. Click &quot;Add Field&quot; to start building your form.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Field {index + 1}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => moveField(index, "up")} disabled={index === 0}>
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => moveField(index, "down")} disabled={index === fields.length - 1}>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeField(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        placeholder="Field Label *"
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        required
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {fieldTypes.map((ft) => (
                          <option key={ft.value} value={ft.value}>{ft.label}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-4">
                        <Input
                          placeholder="Placeholder text"
                          value={field.placeholder}
                          onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        />
                        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          Required
                        </label>
                      </div>
                    </div>

                    {hasOptions(field.type) && (
                      <div className="mt-3 pl-4 border-l-2 border-primary/20">
                        <p className="text-sm font-medium text-gray-600 mb-2">Options</p>
                        {field.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2 mb-2">
                            <Input
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => updateOption(index, optIdx, e.target.value)}
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index, optIdx)}>
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addOption(index)}>
                          <Plus className="w-3 h-3 mr-1" /> Add Option
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Creating..." : "Create Form"}
          </Button>
          <Link href="/admin/forms">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
