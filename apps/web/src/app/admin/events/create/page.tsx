"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FormOption {
  id: string;
  title: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    formId: "",
  });

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const q = query(collection(db, "forms"), where("status", "==", "active"));
      const snapshot = await getDocs(q);
      setForms(snapshot.docs.map((d) => ({ id: d.id, title: d.data().title })));
    } catch (error) {
      console.error("Error loading forms:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageURL = "";
      if (imageFile) {
        const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageURL = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "events"), {
        ...formData,
        imageURL,
        createdAt: new Date().toISOString(),
      });
      router.push("/admin/events");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/events"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
          <p className="text-gray-600">Add a new club event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input id="title" name="title" label="Event Title *" placeholder="e.g., Annual Gala Dinner" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="Describe the event..." value={formData.description} onChange={handleChange} />
            </div>
            <Input id="date" name="date" label="Date *" type="date" value={formData.date} onChange={handleChange} required />
            <Input id="time" name="time" label="Time" type="time" value={formData.time} onChange={handleChange} />
            <Input id="venue" name="venue" label="Venue" placeholder="e.g., Hotel Taj, Ahmedabad" value={formData.venue} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Registration Form (optional)</label>
              <select name="formId" value={formData.formId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">No form</option>
                {forms.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Members will see a &quot;Register&quot; button linking to this form.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={saving}>{saving ? "Creating..." : "Create Event"}</Button>
          <Link href="/admin/events"><Button type="button" variant="outline" size="lg">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
