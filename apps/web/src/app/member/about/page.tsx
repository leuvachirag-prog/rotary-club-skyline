"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Target, Eye, Phone, Mail, MapPin } from "lucide-react";

interface ClubInfo {
  clubName: string;
  district: string;
  charteredDate: string;
  vision: string;
  mission: string;
  presidentName: string;
  presidentPhoto: string;
  presidentMessage: string;
  secretaryName: string;
  secretaryPhone: string;
  secretaryEmail: string;
  meetingDay: string;
  meetingTime: string;
  meetingVenue: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website: string;
}

export default function MemberAboutPage() {
  const [info, setInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClubInfo();
  }, []);

  const loadClubInfo = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "clubInfo"));
      if (docSnap.exists()) {
        setInfo(docSnap.data() as ClubInfo);
      }
    } catch (error) {
      console.error("Error loading club info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Club information not available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">About Our Club</h1>
        <p className="text-gray-600">{info.clubName}</p>
      </div>

      {(info.vision || info.mission) && (
        <Card>
          <CardContent className="py-6 space-y-4">
            {info.vision && (
              <div className="flex gap-3">
                <Eye className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Vision</p>
                  <p className="text-sm text-gray-600">{info.vision}</p>
                </div>
              </div>
            )}
            {info.mission && (
              <div className="flex gap-3">
                <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Mission</p>
                  <p className="text-sm text-gray-600">{info.mission}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {info.presidentName && (
        <Card>
          <CardHeader><CardTitle>President</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {info.presidentPhoto ? (
                <img src={info.presidentPhoto} alt={info.presidentName} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{info.presidentName}</h3>
                {info.presidentMessage && (
                  <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{info.presidentMessage}&rdquo;</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Meeting Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {info.meetingDay && (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Day:</span> {info.meetingDay}
            </p>
          )}
          {info.meetingTime && (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Time:</span> {info.meetingTime}
            </p>
          )}
          {info.meetingVenue && (
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-600">{info.meetingVenue}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {info.secretaryName && (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Secretary:</span> {info.secretaryName}
            </p>
          )}
          {info.contactPhone && (
            <a href={`tel:${info.contactPhone}`} className="flex items-center gap-2 text-sm text-primary">
              <Phone className="w-4 h-4" /> {info.contactPhone}
            </a>
          )}
          {info.contactEmail && (
            <a href={`mailto:${info.contactEmail}`} className="flex items-center gap-2 text-sm text-primary">
              <Mail className="w-4 h-4" /> {info.contactEmail}
            </a>
          )}
          {info.address && (
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-600">{info.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {info.district && (
        <p className="text-xs text-gray-400 text-center">
          {info.district} {info.charteredDate && `· Chartered ${info.charteredDate}`}
        </p>
      )}
    </div>
  );
}
