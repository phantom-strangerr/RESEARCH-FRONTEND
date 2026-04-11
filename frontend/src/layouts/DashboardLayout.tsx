import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        mobileSidebarOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <TopNavbar onMobileMenuToggle={() => setMobileSidebarOpen(v => !v)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 relative">
          {/* Subtle radial gradient overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(74,222,128,0.03) 0%, transparent 60%)' }}></div>
          {children}
        </main>
      </div>
    </div>
  );
};
