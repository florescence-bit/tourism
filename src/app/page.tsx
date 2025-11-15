/**
 * @file src/app/page.tsx
 * @description Home page / landing page.
 * Features:
 * - Shows marketing content about the RAH app
 * - Features section highlighting key capabilities
 * - Links to /auth for sign-in/sign-up
 * - Links to /dashboard for authenticated users
 * - Public page (no auth required to view)
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/firebaseClient';
import {
  MapPin,
  Shield,
  CreditCard,
  AlertCircle,
  BarChart3,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Check if user is already authenticated.
   * If yes, show a button to go to dashboard instead of /auth.
   */
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-black/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            RAH
          </Link>
          {!isLoading && (
            <Link
              href={user ? '/dashboard' : '/auth'}
              className="px-6 py-2 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100 transition"
            >
              {user ? 'Dashboard' : 'Sign In / Up'}
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Your Personal Safety Companion
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Stay safe while traveling. Real-time alerts, threat detection, and community
            support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoading && (
              <>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="px-8 py-3 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 group"
                  >
                    Go to Dashboard{' '}
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition"
                    />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth"
                      className="px-8 py-3 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 group"
                    >
                      Get Started{' '}
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-1 transition"
                      />
                    </Link>
                    <Link
                      href="/auth"
                      className="px-8 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white rounded-2xl font-semibold transition"
                    >
                      Sign In / Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">
          Why Choose RAH?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<MapPin size={32} />}
            title="Smart Check-Ins"
            description="Share your location with trusted contacts instantly"
          />
          <FeatureCard
            icon={<Shield size={32} />}
            title="Threat Detection"
            description="Get real-time safety assessments in your area"
          />
          <FeatureCard
            icon={<CreditCard size={32} />}
            title="Digital ID"
            description="Secure digital identity verification on the go"
          />
          <FeatureCard
            icon={<AlertCircle size={32} />}
            title="Incident Reports"
            description="Report suspicious activities to help the community"
          />
          <FeatureCard
            icon={<BarChart3 size={32} />}
            title="Analytics"
            description="View safety insights and trends in your area"
          />
          <FeatureCard
            icon={<Lock size={32} />}
            title="Privacy First"
            description="Your data is encrypted and secure always"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-6">Ready to Stay Safe?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust RAH to keep them safe
            across India.
          </p>
          {!isLoading && (
            <Link
              href={user ? '/dashboard' : '/auth'}
              className="px-8 py-3 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100 transition inline-block"
            >
              {user ? 'Go to Dashboard' : 'Start Using RAH Now'}
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500">
          <p>
            &copy; 2024 RAH - Indian Tourist Safety App. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Feature card component for displaying app features.
 */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition hover:shadow-xl">
      <div className="mb-4 p-3 bg-gray-800 rounded-2xl w-fit">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
