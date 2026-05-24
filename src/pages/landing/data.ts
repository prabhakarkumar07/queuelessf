import type { LucideIcon } from 'lucide-react';
import {
  Ticket,
  Radio,
  CalendarCheck,
  BarChart3,
  Bell,
  Monitor,
  Stethoscope,
  Landmark,
  Scissors,
  UtensilsCrossed,
  Building2,
  Store,
  Smartphone,
  QrCode,
  CheckCircle2,
} from 'lucide-react';

// ——— Interfaces ———

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: string;
}

export interface IndustryUseCase {
  category: string;
  icon: LucideIcon;
  scenario: string;
  benefits: string[];
}

export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ShowcaseItem {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export interface Metric {
  value: string;
  label: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface NavLink {
  label: string;
  href: string;
}

// ——— Static Content ———

export const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Industries', href: '#industries' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export const FEATURES: Feature[] = [
  {
    icon: Ticket,
    title: 'Token Management',
    description: 'Issue digital tokens, manage priority queues, handle walk-ins, skip, snooze, and rejoin — all from one dashboard.',
    highlight: 'Core',
  },
  {
    icon: Radio,
    title: 'Live Queue Tracking',
    description: 'Real-time position updates via WebSocket. Customers see their exact place, estimated wait, and get notified when called.',
    highlight: 'Real-time',
  },
  {
    icon: CalendarCheck,
    title: 'Appointment Booking',
    description: 'Let customers book time slots, pick providers, and pay online. Automatic queue token on confirmation.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Daily rollups, peak hour patterns, average service time, and staff performance metrics at a glance.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Push alerts, SMS reminders, and in-app updates. Customers know exactly when to arrive — no more waiting rooms.',
  },
  {
    icon: Monitor,
    title: 'Multi-device Support',
    description: 'Mobile app for customers, web dashboard for owners, TV display for waiting areas, and a focused staff view.',
  },
];

export const INDUSTRIES: IndustryUseCase[] = [
  {
    category: 'Clinics & Hospitals',
    icon: Stethoscope,
    scenario: 'Patients check in from the parking lot. Doctors see who is next without paper slips.',
    benefits: ['Reduce waiting room crowding', 'Priority for emergencies', 'Appointment + walk-in hybrid'],
  },
  {
    category: 'Banks & Finance',
    icon: Landmark,
    scenario: 'Customers take a token from their phone. Branch managers see real-time load across counters.',
    benefits: ['Multi-counter routing', 'VIP priority handling', 'Branch-level analytics'],
  },
  {
    category: 'Salons & Spas',
    icon: Scissors,
    scenario: 'Clients book their stylist, see live wait, and arrive just in time for their slot.',
    benefits: ['Provider-specific booking', 'Loyalty points per visit', 'No-show prediction'],
  },
  {
    category: 'Restaurants',
    icon: UtensilsCrossed,
    scenario: 'Diners join the waitlist remotely and get a notification when their table is ready.',
    benefits: ['Reduce walkaway rate', 'Estimated wait display', 'SMS alerts'],
  },
  {
    category: 'Government Offices',
    icon: Building2,
    scenario: 'Citizens take a number online. Staff call the next person without shouting across the hall.',
    benefits: ['Transparent queue position', 'Service-based routing', 'TV display boards'],
  },
  {
    category: 'Retail & Service Centers',
    icon: Store,
    scenario: 'Service desks manage walk-in repairs, returns, and consultations with digital tokens.',
    benefits: ['Walk-in token issuance', 'Transfer between counters', 'Daily capacity limits'],
  },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: 'Scan or Search',
    description: 'Customer finds the shop via QR code, nearby search, or direct link.',
    icon: QrCode,
  },
  {
    step: 2,
    title: 'Get Token',
    description: 'Pick a service, choose a provider if needed, and receive a digital token instantly.',
    icon: Ticket,
  },
  {
    step: 3,
    title: 'Track Live',
    description: 'See real-time position, estimated wait, and queue movement from anywhere.',
    icon: Smartphone,
  },
  {
    step: 4,
    title: 'Get Notified',
    description: 'Receive a push notification or SMS when your turn is approaching.',
    icon: Bell,
  },
  {
    step: 5,
    title: 'Walk In & Done',
    description: 'Arrive just in time. Staff marks you served. Earn loyalty points.',
    icon: CheckCircle2,
  },
];

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    title: 'Owner Dashboard',
    description: 'Live queue, today\'s stats, and one-click actions for your team.',
    imageSrc: '/landing/dashboard-preview.webp',
    imageAlt: 'QueueLess owner dashboard showing live queue management with token cards and daily statistics',
  },
  {
    title: 'Customer Mobile App',
    description: 'Find shops, join queues, and track your position in real time.',
    imageSrc: '/landing/mobile-token.webp',
    imageAlt: 'QueueLess mobile app showing active token with queue position and estimated wait time',
  },
  {
    title: 'TV Display',
    description: 'Waiting area screen showing current and upcoming tokens.',
    imageSrc: '/landing/tv-display.webp',
    imageAlt: 'QueueLess TV display mode showing now serving token and waiting list for a clinic',
  },
];

export const METRICS: Metric[] = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<200ms', label: 'Queue Updates' },
  { value: '500+', label: 'Tokens/day per shop' },
  { value: '6', label: 'Industry verticals' },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Industries', href: '/#industries' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'TV Display', href: '/tv/demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/contact' },
      { label: 'Contact Support', href: '/contact' },
      { label: 'System Status', href: 'https://status.queueless.in' },
      { label: 'Report an Issue', href: '/contact?category=technical' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refund' },
    ],
  },
];

