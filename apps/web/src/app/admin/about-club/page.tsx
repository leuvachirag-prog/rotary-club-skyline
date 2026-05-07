"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

interface ClubInfo {
  clubName: string;
  tagline: string;
  description: string;
  history: string;
  vision: string;
  mission: string;
  values: string;
  presidentName: string;
  presidentMessage: string;
  presidentPhoto: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website: string;
  logoURL: string;
}

const defaultInfo: ClubInfo = {
  clubName: "Rotary Club of Ahmedabad Skyline",
  tagline: "Service Above Self",
  description: "",
  history: "",
  vision: "",
  mission: "",
  values: "",
  presidentName: "",
  presidentMessage: "",
  presidentPhoto: "",
  contactEmail: "",
  contactPhone: "",
  address: "Ahmedabad, Gujarat, India",
  website: "",
  logoURL: "",
};

export default function AboutClubPage() {
  const [info, setInfo] = useState<ClubInfo>(defaultInfo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [presidentPhotoFile, setPresidentPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    loadClubInfo();
  }, []);

  const loadClubInfo = async () => {
    try {
      const docSnap = await getDoc(doc(db, "clubInfo", "main"));
      if (docSnap.exists()) {
        setInfo({ ...defaultInfo, ...docSnap.data() } as ClubInfo);
      }
    } catch (error) {
      console.error("Error loading club info:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...info };
      if (logoFile) {
        data.logoURL = await uploadPhoto(logoFile, `club/logo_${Date.now()}`);
      }
      if (presidentPhotoFile) {
        data.presidentPhoto = await uploadPhoto(presidentPhotoFile, `club/president_${Date.now()}`);
      }
      await setDoc(doc(db, "clubInfo", "main"), data);
      setInfo(data);
      setLogoFile(null);
      setPresidentPhotoFile(null);
      alert("Club information saved successfully!");
    } catch (error) {
      console.error("Error saving club info:", error);
      alert("Error saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">About Club</h1>
        <p className="text-gray-600">Manage club information, president details, vision & mission</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Club Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="clubName" name="clubName" label="Club Name" value={info.clubName} onChange={handleChange} />
            <Input id="tagline" name="tagline" label="Tagline" value={info.tagline} onChange={handleChange} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={3} value={info.description} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">History</label>
              <textarea name="history" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={3} value={info.history} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Logo</label>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary" />
              {info.logoURL && <img src={info.logoURL} alt="Logo" className="mt-2 w-20 h-20 object-contain" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vision, Mission & Values</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vision</label>
              <textarea name="vision" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={3} value={info.vision} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
              <textarea name="mission" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={3} value={info.mission} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Values</label>
              <textarea name="values" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={3} value={info.values} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>President Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="presidentName" name="presidentName" label="President Name" value={info.presidentName} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">President Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setPresidentPhotoFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary" />
              {info.presidentPhoto && <img src={info.presidentPhoto} alt="President" className="mt-2 w-20 h-20 object-cover rounded-full" />}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">President&apos;s Message</label>
              <textarea name="presidentMessage" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={4} value={info.presidentMessage} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="contactEmail" name="contactEmail" label="Email" type="email" value={info.contactEmail} onChange={handleChange} />
            <Input id="contactPhone" name="contactPhone" label="Phone" type="tel" value={info.contactPhone} onChange={handleChange} />
            <Input id="address" name="address" label="Address" value={info.address} onChange={handleChange} />
            <Input id="website" name="website" label="Website" type="url" value={info.website} onChange={handleChange} />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
