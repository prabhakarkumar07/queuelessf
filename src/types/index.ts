// src/types/index.ts

export type Role = 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN' | 'SERVICE_PROVIDER';
export type TokenStatus = 'WAITING' | 'CALLED' | 'ARRIVED' | 'SERVING' | 'SERVED' | 'SKIPPED' | 'CANCELLED' | 'EXPIRED';
export type TokenPriority = 'NORMAL' | 'SENIOR' | 'PREGNANT' | 'VIP' | 'EMERGENCY';
export type ShopCategory = 'CLINIC' | 'SALON' | 'BANK' | 'GOVERNMENT' | 'RESTAURANT' | 'OTHER';
export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type AnnouncementType = 'INFO' | 'WARNING' | 'CLOSURE';
export type WaitlistStatus = 'WAITING' | 'NOTIFIED' | 'JOINED' | 'EXPIRED';
export type ShopStatus = 'OPEN' | 'CLOSED' | 'BREAK' | 'CLOSES_SOON' | 'HOLIDAY';
export type VerificationStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
export type IncidentStatus = 'NORMAL' | 'DELAYED' | 'EMERGENCY_CLOSURE' | 'SYSTEM_DOWN';
export type StaffRole = 'RECEPTIONIST' | 'PROVIDER' | 'MANAGER';

export interface BusinessAccount {
  id: string;
  name: string;
  billingEmail?: string;
  gstin?: string;
  taxPercent?: number;
  invoicePrefix?: string;
  razorpayKeyId?: string;
  stripePublishableKey?: string;
  payoutAccountName?: string;
  payoutAccountNumberMasked?: string;
  payoutIfsc?: string;
  smsSenderId?: string;
  whatsappNumber?: string;
  settlementFrequency?: string;
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Shop {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  category: ShopCategory;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  logoUrl?: string | null;
  primaryColor?: string;
  incidentStatus?: string;
  incidentMessage?: string;
  businessRegistrationNumber?: string;
  businessAccountId?: string;
  businessAccountName?: string;
  branchCode?: string;
  slug?: string;
  verificationStatus?: VerificationStatus;
  active: boolean;
  queuePaused: boolean;
  openTime: string;
  closeTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  closedDays?: Weekday[];
  avgServiceMins: number;
  maxQueueSize: number;
  noShowGraceMins?: number;
  rejoinWindowMins?: number;
  maxRejoins?: number;
  currentQueueSize?: number;
  estimatedWaitMins?: number;
  distanceKm?: number;
  myStaffRole?: StaffRole;
  createdAt: string;
}

export interface ShopStatusInfo {
  status: ShopStatus;
  reason?: string;
  nextChangeAt?: string;
}

export interface Service {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  durationMins: number;
  price: number;
  active: boolean;
}

export interface Token {
  id: string;
  shopId: string;
  shopName: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  serviceId?: string;
  serviceName?: string;
  providerId?: string;
  providerName?: string;
  tokenNumber: number;
  displayNumber: string;
  status: TokenStatus;
  priority: TokenPriority;
  queuePosition?: number;
  tokensAhead?: number;
  estimatedWaitMins?: number;
  issuedAt: string;
  calledAt?: string;
  servedAt?: string;
  dateIssued: string;
  rejoinCount?: number;
  skippedAt?: string;
  noShowProbability?: number;
  snoozeCount?: number;
}

export interface LiveQueue {
  shopId: string;
  shopName: string;
  queuePaused: boolean;
  totalWaiting: number;
  totalServedToday: number;
  avgServiceMins: number;
  currentTokenDisplay: string;
  waitingTokens: Token[];
  lastUpdated: string;
}

export interface QueueUpdateEvent {
  shopId: string;
  eventType: string;
  currentToken: string;
  waitingCount: number;
  waitingTokens: Token[];
  timestamp: string;
}

export interface ShopStats {
  totalTokensToday: number;
  servedToday: number;
  waitingNow: number;
  cancelledToday: number;
  avgWaitMinutes: number;
  totalAppointments: number;
  revenueToday: number;
}

export interface Appointment {
  id: string;
  shopId: string;
  shopName: string;
  serviceId: string;
  serviceName: string;
  providerId?: string;
  providerName?: string;
  scheduledAt: string;
  durationMins: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  razorpayOrderId?: string;
  notes?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
}

export interface ServiceProvider {
  id: string;
  shopId: string;
  userId?: string;
  name: string;
  phone: string;
  title: string;
  serviceIds?: string[];
  serviceNames?: string[];
  staffRole?: StaffRole;
  active: boolean;
  available: boolean;
}

// ——— Announcements ———
export interface Announcement {
  id: string;
  shopId: string;
  shopName: string;
  title: string;
  message: string;
  type: AnnouncementType;
  validFrom: string;
  validTo?: string;
  createdAt: string;
}

// ——— Reviews ———
export interface Review {
  id: string;
  shopId: string;
  shopName: string;
  userId: string;
  userName: string;
  tokenId?: string;
  appointmentId?: string;
  rating: number;
  comment?: string;
  visible?: boolean;
  moderationStatus?: string;
  moderationReason?: string;
  createdAt: string;
}

export interface QrPoster {
  shopId: string;
  shopName: string;
  branchCode?: string;
  qrPayload: string;
  qrSvg: string;
  posterTitle: string;
  posterSubtitle: string;
}



export type SubscriptionPlan = 'FREE' | 'STARTER' | 'GROWTH' | 'PRO';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';

export interface ShopSubscription {
  id?: string;
  shopId: string;
  shopName?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

export interface StaffHeartbeat {
  id: string;
  shopId: string;
  providerId: string;
  staffName: string;
  deviceId: string;
  appVersion?: string;
  online: boolean;
  lastSeenAt: string;
}

export interface ReviewSummary {
  avgRating: number;
  totalReviews: number;
  breakdown: Record<number, number>;
}

export interface LoyaltyData {
  id?: string;
  shopId: string;
  shopName?: string;
  points: number;
  totalVisits: number;
  tier: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD';
  bronzeThreshold: number;
  silverThreshold: number;
  goldThreshold: number;
  updatedAt?: string;
}

// ——— Waitlist ———
export interface WaitlistEntry {
  id: string;
  shopId: string;
  shopName: string;
  serviceId?: string;
  serviceName?: string;
  joinedAt: string;
  status: WaitlistStatus;
  positionAhead: number;
}

// ——— Holidays ———
export interface Holiday {
  id: string;
  date: string;
  reason?: string;
}

// ——— Analytics ———
export interface Analytics {
  dailyTraffic: { date: string; count: number }[];
  hourlyHeatmap: { hour: number; count: number }[];
  noShowRate: number;
  servicePopularity: { service: string; count: number }[];
  providerPerformance: { name: string; total: number; served: number }[];
}
