"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, User, Mail, Phone, MapPin, Briefcase, Heart, Droplet } from "lucide-react";

interface MemberProfile {
  displayName: string;
  email: string;
  phone: string;
  birthday: string;
  anniversary: string;
  address: string;
  city: string;
  profession: string;
  company: string;
  bloodGroup: string;
  spouseName: string;
  spouseBirthday: string;
  photoURL: string;
  status: string;
}

export default function MemberProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<MemberProfile>>({});

  useEffect(() => {
    if (user?.memberId) {
      loadProfile(user.memberId);
    } else if (user?.uid) {
      loadProfile(user.uid);
    }
  }, [user]);

  const loadProfile = async (id: string) => {
    try {
      const docSnap = await getDoc(doc(db, "members", id));
      if (docSnap.exists()) {
        setProfile(docSnap.data() as MemberProfile);
      } else {
        const userDoc = await getDoc(doc(db, "users", user?.uid || ""));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as MemberProfile);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditData({
      phone: profile?.phone || "",
      address: profile?.address || "",
      city: profile?.city || "",
      profession: profile?.profession || "",
      company: profile?.company || "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const id = user.memberId || user.uid;
      await updateDoc(doc(db, "members", id), editData);
      setProfile((prev) => prev ? { ...prev, ...editData } : null);
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="space-y-6">
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4" />
              ) : (
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mb-4">
                  {profile?.displayName?.charAt(0)?.toUpperCase() || user?.displayName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900">{profile?.displayName || user?.displayName}</h2>
              <p className="text-gray-500">{profile?.email || user?.email}</p>
              <Badge variant={profile?.status === "active" ? "success" : "warning"} className="mt-2">
                {profile?.status || "Member"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {!editing && <Button variant="outline" size="sm" onClick={startEditing}>Edit</Button>}
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <Input label="Phone" value={editData.phone || ""} onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))} />
                <Input label="Address" value={editData.address || ""} onChange={(e) => setEditData((p) => ({ ...p, address: e.target.value }))} />
                <Input label="City" value={editData.city || ""} onChange={(e) => setEditData((p) => ({ ...p, city: e.target.value }))} />
                <Input label="Profession" value={editData.profession || ""} onChange={(e) => setEditData((p) => ({ ...p, profession: e.target.value }))} />
                <Input label="Company" value={editData.company || ""} onChange={(e) => setEditData((p) => ({ ...p, company: e.target.value }))} />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                <InfoRow icon={Mail} label="Email" value={profile?.email || user?.email} />
                <InfoRow icon={MapPin} label="Address" value={[profile?.address, profile?.city].filter(Boolean).join(", ")} />
                <InfoRow icon={Briefcase} label="Profession" value={profile?.profession} />
                <InfoRow icon={Briefcase} label="Company" value={profile?.company} />
                <InfoRow icon={Droplet} label="Blood Group" value={profile?.bloodGroup} />
                <InfoRow icon={Heart} label="Birthday" value={profile?.birthday ? new Date(profile.birthday).toLocaleDateString("en-IN") : undefined} />
                <InfoRow icon={Heart} label="Anniversary" value={profile?.anniversary ? new Date(profile.anniversary).toLocaleDateString("en-IN") : undefined} />
              </div>
            )}
          </CardContent>
        </Card>

        {profile?.spouseName && (
          <Card>
            <CardHeader><CardTitle>Spouse Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={User} label="Name" value={profile.spouseName} />
                <InfoRow icon={Heart} label="Birthday" value={profile.spouseBirthday ? new Date(profile.spouseBirthday).toLocaleDateString("en-IN") : undefined} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}
