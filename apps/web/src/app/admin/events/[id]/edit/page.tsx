"use client";

import { useState, useEffect, use } from "react";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
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

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageURL, setCurrentImageURL] = useState("");
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
    loadEvent();
    loadForms();
  }, [id]);

  const loadEvent = async () => {
    try {
      const docSnap = await getDoc(doc(db, "events", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          title: data.title || "",
          description: data.description || "",
          date: data.date || "",
          time: data.time || "",
          venue: data.venue || "",
          formId: data.formId || "",
        });
        setCurrentImageURL(data.imageURL || "");
      }
    } catch (error) {
      console.error("Error loading event:", error);
    } finally {
      setLoading(false);
    }
  };

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
      let imageURL = currentImageURL;
      if (imageFile) {
        const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageURL = await getDownloadURL(storageRef);
      }
      await updateDoc(doc(db, "events", id), { ...formData, imageURL });
      router.push("/admin/events");
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/events"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600">{formData.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input id="title" name="title" label="Event Title *" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={3} value={formData.description} onChange={handleChange} />
            </div>
            <Input id="date" name="date" label="Date *" type="date" value={formData.date} onChange={handleChange} required />
            <Input id="time" name="time" label="Time" type="time" value={formData.time} onChange={handleChange} />
            <Input id="venue" name="venue" label="Venue" value={formData.venue} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Registration Form</label>
              <select name="formId" value={formData.formId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">No form</option>
                {forms.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
              {currentImageURL && <img src={currentImageURL} alt="Current" className="w-32 h-20 object-cover rounded mb-2" />}
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={saving}>{saving ? "Saving..." : "Update Event"}</Button>
          <Link href="/admin/events"><Button type="button" variant="outline" size="lg">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
