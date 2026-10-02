'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{ width: 24, height: 24, background: 'var(--accent)', borderRadius: 4 }}></div>
          <div>
            <div className="sidebar-brand">psense.ai</div>
            <div className="sidebar-subtitle">CRM - Enterprise</div>
          </div>
        </div>

        <div className="sidebar-section">MAIN</div>
        <Link href="/dashboard" className={`sidebar-item ${pathname === '/dashboard' ? 'active' : ''}`}>
          <span>Dashboard</span>
        </Link>

        <div className="sidebar-section" style={{ color: 'white', marginTop: '10px' }}>TENDERS</div>
        <Link href="/dashboard/tenders" className={`sidebar-item ${pathname === '/dashboard/tenders' ? 'active' : ''}`}>
          <span>Domestic Tenders</span>
        </Link>
        <div className="sidebar-item">Global Tenders</div>
        <div className="sidebar-item">Corrigendum Updates</div>
        <div className="sidebar-item">Live Auctions / Reverse Auctions</div>
        
        <div className="sidebar-section" style={{ color: 'white', marginTop: '10px' }}>MANAGEMENT</div>
        <div className="sidebar-item">Tender Uploads & Submissions</div>
        <div className="sidebar-item">EMD / BG Tracking</div>
        <div className="sidebar-item">Vendor Registration</div>
        <div className="sidebar-item">Tender Reports / Analytics</div>
        
        <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="sidebar-item" onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}>
            Logout
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="main-wrapper">
        {/* Topbar */}
        <div className="topbar">
          <div className="search-bar">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search customers, tickets, leads..." />
          </div>
          
          <div className="topbar-right">
            <span>🌙</span>
            <div style={{ position: 'relative', cursor: 'pointer' }} title="Alerts">
              <span>🔔</span>
              <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--danger)', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px' }}>!</span>
            </div>
            <div className="user-profile" style={{ cursor: 'pointer' }} title="Settings / Change Password">
              <div className="user-info">
                <div className="user-name">MALLADI MOHANA MURALI KRISHNA</div>
                <div className="user-role">Executive - Hyderabad - EXECUTIVE</div>
              </div>
              <div className="avatar">MM</div>
              <span style={{ fontSize: '1.2rem', marginLeft: '5px' }}>⚙️</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="content-area">
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#991b1b' }}>Alert: Upcoming Tenders!</strong> 
              <span style={{ color: '#b91c1c', marginLeft: '10px' }}>You have tenders approaching their submission deadline in the next 7 days. Please check the Tenders List.</span>
            </div>
            <button className="btn" style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => router.push('/dashboard/tenders')}>View</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
