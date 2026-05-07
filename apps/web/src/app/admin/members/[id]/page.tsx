"use client";

import { useState, useEffect, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Phone, Mail, MapPin, Briefcase, Droplet, Heart, Cake, Users } from "lucide-react";
import Link from "next/link";

interface FamilyMember {
  name: string;
  relation: string;
  birthday: string;
  phone: string;
}

interface Member {
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
  photoURL: string;
  couplePhotoURL: string;
  spouseName: string;
  spouseBirthday: string;
  spousePhone: string;
  familyMembers: FamilyMember[];
  status: string;
  createdAt: string;
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      const docSnap = await getDoc(doc(db, "members", id));
      if (docSnap.exists()) {
        setMember(docSnap.data() as Member);
      }
    } catch (error) {
      console.error("Error loading member:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  if (!member) {
    return <div className="text-center py-12 text-gray-500">Member not found.</div>;
  }

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/members"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <h1 className="text-2xl font-bold text-gray-900">Member Details</h1>
        </div>
        <Link href={`/admin/members/${id}/edit`}><Button><Edit2 className="w-4 h-4 mr-2" /> Edit</Button></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="py-6 text-center">
            {member.photoURL ? (
              <img src={member.photoURL} alt={member.displayName} className="w-32 h-32 rounded-full object-cover mx-auto mb-4" />
            ) : (
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl font-bold mx-auto mb-4">
                {member.displayName?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">{member.displayName}</h2>
            <p className="text-gray-500 text-sm">{member.profession}{member.company ? ` at ${member.company}` : ""}</p>
            <Badge variant={member.status === "active" ? "success" : member.status === "pending" ? "warning" : "danger"} className="mt-2">
              {member.status}
            </Badge>
            <p className="text-xs text-gray-400 mt-3">Member since {formatDate(member.createdAt)}</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Mail} label="Email" value={member.email} />
                <InfoRow icon={Phone} label="Phone" value={member.phone} />
                <InfoRow icon={MapPin} label="Address" value={[member.address, member.city].filter(Boolean).join(", ")} />
                <InfoRow icon={Briefcase} label="Profession" value={member.profession} />
                <InfoRow icon={Briefcase} label="Company" value={member.company} />
                <InfoRow icon={Droplet} label="Blood Group" value={member.bloodGroup} />
                <InfoRow icon={Cake} label="Birthday" value={formatDate(member.birthday)} />
                <InfoRow icon={Heart} label="Anniversary" value={formatDate(member.anniversary)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Spouse Details</CardTitle></CardHeader>
            <CardContent>
              {member.spouseName ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={Users} label="Name" value={member.spouseName} />
                  <InfoRow icon={Cake} label="Birthday" value={formatDate(member.spouseBirthday)} />
                  <InfoRow icon={Phone} label="Phone" value={member.spousePhone} />
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No spouse details added.</p>
              )}
              {member.couplePhotoURL && (
                <img src={member.couplePhotoURL} alt="Couple" className="mt-4 rounded-lg max-h-48 object-cover" />
              )}
            </CardContent>
          </Card>

          {member.familyMembers && member.familyMembers.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Family Members</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {member.familyMembers.map((fm, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{fm.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{fm.relation} {fm.phone && `• ${fm.phone}`}</p>
                      </div>
                      {fm.birthday && (
                        <span className="text-sm text-gray-500">{formatDate(fm.birthday)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
