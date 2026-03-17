"use client";
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardSidebar } from '../../components/dashboard/Bars/DashboardSidebar';
import { Navbar } from '../../components/Home/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <DashboardSidebar />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}