"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface FamilyMember {
  name: string;
  relation: string;
  birthday: string;
  phone: string;
}

export default function AddMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [memberPhoto, setMemberPhoto] = useState<File | null>(null);
  const [couplePhoto, setCouplePhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    birthday: "",
    anniversary: "",
    address: "",
    city: "",
    profession: "",
    company: "",
    bloodGroup: "",
    spouseName: "",
    spouseBirthday: "",
    spousePhone: "",
  });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addFamilyMember = () => {
    setFamilyMembers((prev) => [...prev, { name: "", relation: "", birthday: "", phone: "" }]);
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    setFamilyMembers((prev) =>
      prev.map((fm, i) => (i === index ? { ...fm, [field]: value } : fm))
    );
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhoto = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoURL = "";
      let couplePhotoURL = "";

      if (memberPhoto) {
        photoURL = await uploadPhoto(memberPhoto, `members/${Date.now()}_${memberPhoto.name}`);
      }
      if (couplePhoto) {
        couplePhotoURL = await uploadPhoto(couplePhoto, `members/${Date.now()}_couple_${couplePhoto.name}`);
      }

      await addDoc(collection(db, "members"), {
        ...formData,
        photoURL,
        couplePhotoURL,
        familyMembers,
        status: "active",
        createdAt: new Date().toISOString(),
      });

      router.push("/admin/members");
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Error adding member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/members">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Member</h1>
          <p className="text-gray-600">Fill in the member details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="displayName" name="displayName" label="Full Name *" value={formData.displayName} onChange={handleChange} required />
            <Input id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} />
            <Input id="phone" name="phone" label="Phone Number *" type="tel" value={formData.phone} onChange={handleChange} required />
            <Input id="birthday" name="birthday" label="Birthday" type="date" value={formData.birthday} onChange={handleChange} />
            <Input id="profession" name="profession" label="Profession" value={formData.profession} onChange={handleChange} />
            <Input id="company" name="company" label="Company/Business" value={formData.company} onChange={handleChange} />
            <Input id="address" name="address" label="Address" value={formData.address} onChange={handleChange} />
            <Input id="city" name="city" label="City" value={formData.city} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMemberPhoto(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Spouse Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="spouseName" name="spouseName" label="Spouse Name" value={formData.spouseName} onChange={handleChange} />
            <Input id="spouseBirthday" name="spouseBirthday" label="Spouse Birthday" type="date" value={formData.spouseBirthday} onChange={handleChange} />
            <Input id="spousePhone" name="spousePhone" label="Spouse Phone" type="tel" value={formData.spousePhone} onChange={handleChange} />
            <Input id="anniversary" name="anniversary" label="Anniversary Date" type="date" value={formData.anniversary} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couple Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCouplePhoto(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Family Members (Kids & Others)</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {familyMembers.length === 0 ? (
              <p className="text-gray-500 text-sm">No family members added.</p>
            ) : (
              <div className="space-y-4">
                {familyMembers.map((fm, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
                    <Input
                      placeholder="Name"
                      value={fm.name}
                      onChange={(e) => updateFamilyMember(index, "name", e.target.value)}
                    />
                    <select
                      value={fm.relation}
                      onChange={(e) => updateFamilyMember(index, "relation", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Relation</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="other">Other</option>
                    </select>
                    <Input
                      type="date"
                      placeholder="Birthday"
                      value={fm.birthday}
                      onChange={(e) => updateFamilyMember(index, "birthday", e.target.value)}
                    />
                    <Input
                      type="tel"
                      placeholder="Phone"
                      value={fm.phone}
                      onChange={(e) => updateFamilyMember(index, "phone", e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFamilyMember(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Saving..." : "Save Member"}
          </Button>
          <Link href="/admin/members">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
