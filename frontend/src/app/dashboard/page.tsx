'use client';

import { useState, useEffect } from 'react';

interface Tender {
  _id?: string;
  tenderValue?: number;
  orderValue?: number;
  tenderStatus?: string;
  poNumber?: string;
  customerName?: string;
  zone?: string;
  branchManager?: string;
}

export default function DashboardSummary() {
  const [tenders, setTenders] = useState<Tender[]>([]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/tenders`)
      .then(res => res.json())
      .then(data => setTenders(data))
      .catch(err => console.error(err));
  }, []);

  const activeTenders = tenders.filter(t => t.tenderStatus !== 'Expired' && t.tenderStatus !== 'Pending');
  const pendingTenders = tenders.filter(t => t.tenderStatus === 'Pending');
  
  const totalValue = activeTenders.reduce((sum, t) => sum + (Number(t.tenderValue) || 0), 0);
  const awardedValue = tenders.filter(t => t.tenderStatus === 'Order').reduce((sum, t) => sum + (Number(t.orderValue) || 0), 0);
  const pendingValue = pendingTenders.reduce((sum, t) => sum + (Number(t.tenderValue) || 0), 0);

  // Format currency
  const formatCur = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
  };

  const statusCount = {
    Inprogress: tenders.filter(t => t.tenderStatus === 'Inprogress').length,
    Order: tenders.filter(t => t.tenderStatus === 'Order').length,
    Pending: tenders.filter(t => t.tenderStatus === 'Pending').length,
    Expired: tenders.filter(t => t.tenderStatus === 'Expired').length,
    NotReceived: tenders.filter(t => t.tenderStatus === 'Order not Received').length,
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenders Dashboard</h1>
          <div className="page-subtitle">Portfolio overview - All Time</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Last updated: Just now</div>
        </div>
        <div className="controls-row">
          <select className="filter-input"><option>All Time</option></select>
          <select className="filter-input"><option>2026-10</option></select>
          <select className="filter-input"><option>All branches</option></select>
          <button className="btn btn-primary">Search</button>
          <button className="btn">Clear</button>
          <button className="btn">Export</button>
          <button className="btn" onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderTopColor: '#8b5cf6' }}>
          <div className="kpi-card-title">ACTIVE TENDERS ⓘ</div>
          <div className="kpi-card-value">{activeTenders.length}</div>
          <div className="kpi-card-sub">{tenders.length} Total Uploaded</div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: '#6d28d9' }}>
          <div className="kpi-card-title">PORTFOLIO VALUE ⓘ</div>
          <div className="kpi-card-value">{formatCur(totalValue)}</div>
          <div className="kpi-card-sub">Total Value of Active</div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: '#10b981' }}>
          <div className="kpi-card-title">AWARDED REVENUE ⓘ</div>
          <div className="kpi-card-value">{formatCur(awardedValue)}</div>
          <div className="kpi-card-sub">Contracts won</div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: '#ef4444' }}>
          <div className="kpi-card-title">PENDING VALUATION ⓘ</div>
          <div className="kpi-card-value">{formatCur(pendingValue)}</div>
          <div className="kpi-card-sub">In evaluation stage</div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: '#f59e0b' }}>
          <div className="kpi-card-title">CLOSING SOON ⓘ</div>
          <div className="kpi-card-value">0 Tenders</div>
          <div className="kpi-card-sub">Closing in 60d - 90d</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Tender Status Breakdown</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            {tenders.length > 0 ? (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                 <ul>
                   <li style={{color: '#6366f1'}}>Inprogress: {statusCount.Inprogress}</li>
                   <li style={{color: '#10b981'}}>Order: {statusCount.Order}</li>
                   <li style={{color: '#f59e0b'}}>Pending: {statusCount.Pending}</li>
                   <li style={{color: '#ef4444'}}>Not Received: {statusCount.NotReceived}</li>
                 </ul>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>No data available</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Expiry Analysis</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb', justifyContent: 'center' }}>
            {tenders.length > 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>Chart rendering...</div>
            ) : (
              <div style={{ color: 'var(--text-muted)', paddingBottom: '100px' }}>No data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="chart-title" style={{ marginBottom: 0 }}>Top Tenders by Value</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Customer</th>
              <th>Zone / Manager</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tenders.length > 0 ? (
              tenders.slice(0, 5).map(t => (
                <tr key={t._id}>
                  <td>{t.poNumber || '--'}</td>
                  <td>{t.customerName || '--'}</td>
                  <td>{t.zone} / {t.branchManager}</td>
                  <td>₹{t.tenderValue || 0}</td>
                  <td><span className="status-badge">{t.tenderStatus}</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{textAlign: 'center'}}>0 records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
