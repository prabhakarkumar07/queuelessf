import { lazy, Suspense } from 'react';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { SEOHead } from './SEOHead';

const FeaturesSection = lazy(() => import('./FeaturesSection'));
const IndustrySection = lazy(() => import('./IndustrySection'));
const WorkflowSection = lazy(() => import('./WorkflowSection'));
const DashboardShowcase = lazy(() => import('./DashboardShowcase'));
const TrustSection = lazy(() => import('./TrustSection'));
const PricingCTA = lazy(() => import('./PricingCTA'));
const Footer = lazy(() => import('./Footer'));

function SectionSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead
        title="QueueLess — Digital Queue Management for Walk-in Businesses"
        description="Manage queues, appointments, and customer flow for clinics, salons, banks, and more. Real-time tracking, smart notifications, and analytics."
        canonicalUrl="https://queueless.in"
        ogImage="https://queueless.in/landing/og-image.png"
      />
      <LandingNav />
      <main role="main">
        <HeroSection />
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturesSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <IndustrySection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <WorkflowSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <DashboardShowcase />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <TrustSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <PricingCTA />
        </Suspense>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </main>
    </div>
  );
}
