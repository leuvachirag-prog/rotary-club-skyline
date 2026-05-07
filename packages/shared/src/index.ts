export type UserRole = "super_admin" | "sub_admin" | "member";

export type ModuleAccess =
  | "membership"
  | "events_forms"
  | "transactions"
  | "announcements"
  | "wishes"
  | "about_club"
  | "suggestions"
  | "wall"
  | "polls";

export type MemberStatus = "active" | "inactive" | "pending";

export interface Member {
  id: string;
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
  status: MemberStatus;
  createdAt: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
  birthday: string;
  phone: string;
}

export interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  options: string[];
}

export interface FormDefinition {
  id: string;
  title: string;
  description: string;
  type: string;
  fields: FormField[];
  status: "active" | "inactive";
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  responses: Record<string, unknown>;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  imageURL?: string;
  priority: "normal" | "high" | "urgent";
  createdAt: string;
}

export interface WallPost {
  id: string;
  content: string;
  imageURL?: string;
  authorId: string;
  authorName: string;
  approved: boolean;
  likes: string[];
  createdAt: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  multiSelect: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: "dues" | "donation" | "event" | "other";
  amount: number;
  description: string;
  date: string;
  status: "paid" | "pending";
  createdAt: string;
}

export interface Suggestion {
  id: string;
  subject: string;
  category: "suggestion" | "complaint";
  description: string;
  attachmentURL?: string;
  submittedBy: string;
  submittedByName: string;
  status: "open" | "in_progress" | "resolved";
  adminResponse?: string;
  createdAt: string;
}
