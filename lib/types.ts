export interface User {
  id: string;
  email: string;
  name: string;
  role: "host" | "vendor" | "admin";
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
}

export interface Vendor {
  id: string;
  userId: string;
  companyName: string;
  logoUrl?: string | null;
  description?: string | null;
  branding: Record<string, unknown>;
  subscription: "free" | "pro" | "enterprise";
  maxEvents?: number | null;
  createdAt: Date;
}

export interface Event {
  id: string;
  hostId: string;
  vendorId?: string | null;
  title: string;
  slug: string;
  eventType: "wedding" | "birthday" | "graduation" | "corporate" | "other";
  description?: string | null;
  date: Date;
  startTime: Date;
  endTime: Date;
  venue?: string | null;
  status: "draft" | "active" | "live" | "ended";
  settings: EventSettings;
  branding: EventBranding;
  createdAt: Date;
}

export interface EventSettings {
  moderationEnabled?: boolean;
  maxPhotosPerGuest?: number | null;
  slideshowInterval?: number;
  slideshowTransition?: "fade" | "slide" | "zoom";
  autoApprove?: boolean;
}

export interface EventBranding {
  accentColor?: string;
  logoUrl?: string | null;
  template?: string;
}

export interface Photo {
  id: string;
  eventId: string;
  fileKey: string;
  fileUrl: string;
  fileProvider: "cloudinary" | "s3" | "r2" | "local";
  thumbnailUrl: string;
  guestName?: string | null;
  guestIp?: string | null;
  message?: string | null;
  status: "pending" | "approved" | "hidden" | "deleted";
  metadata: PhotoMetadata;
  uploadedAt: Date;
  moderatedAt?: Date | null;
}

export interface PhotoMetadata {
  width?: number;
  height?: number;
  format?: string;
  sizeBytes?: number;
}

export interface Order {
  id: string;
  eventId: string;
  userId: string;
  amount: number;
  package: "free" | "pro_event" | "vendor_monthly" | "vendor_yearly";
  status: "pending" | "paid" | "expired" | "cancelled";
  paymentMethod?: string | null;
  paymentProofUrl?: string | null;
  paidAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Event list item for dashboard
export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  eventType: Event["eventType"];
  date: Date;
  status: Event["status"];
  _count: {
    photos: number;
  };
}
