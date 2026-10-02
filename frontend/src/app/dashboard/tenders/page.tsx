'use client';

import { useState, useEffect } from 'react';

interface Tender {
  _id?: string;
  tenderNumber?: string;
  month?: string;
  tenderType?: string;
  otherTenderType?: string;
  bidOfferValidity?: string;
  location?: string;
  branch?: string;
  itemCategory?: string;
  contractPeriod?: string;
  minAnnualTurnover?: string;
  experienceRequired?: string;
  docsRequired?: string;
  bidType?: string;
  emdRequired?: string;
  tenderRemarks?: string;
  customerName?: string;
  contactName?: string;
  mobileNumber?: string;
  emailId?: string;
  tenderWebLink?: string;
  tenderName?: string;
  tenderPublishDate?: string;
  tenderValue?: number;
  tenderLastDate?: string;
  emdValue?: number;
  emdDetails?: string;
  bgValue?: string;
  bgNumber?: string;
  bgBankName?: string;
  bgBranch?: string;
  bgValidFrom?: string;
  bgValidEnd?: string;
  zone?: string;
  branchManager?: string;
  tenderSubmissionDate?: string;
  tenderQuoteValue?: number;
  quoteValidUpto?: string;
  tenderStatus?: string;
  poNumber?: string;
  poDate?: string;
  orderValue?: number;
  contractValidFrom?: string;
  contractValidEnd?: string;
  remarks?: string;
  tenderDocument?: string;
  boqDocument?: string;
  annexure1?: string;
  annexure2?: string;
  annexure3?: string;
  subTenderDocument?: string;
  subEmdDocument?: string;
  subBgDocument?: string;
  subOtherDocuments?: string;
}

export default function TendersList() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeTab, setActiveTab] = useState<'tenders' | 'submissions'>('tenders');
  
  const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Tender>>({});

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/tenders`);
      const data = await res.json();
      setTenders(data);
    } catch (err) {
      console.error('Failed to fetch tenders');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTenderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tenderId = e.target.value;
    if (!tenderId) {
      setFormData({});
      return;
    }
    const selected = tenders.find(t => t._id === tenderId);
    if (selected) {
      setFormData(selected);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (tender: Tender) => {
    setFormData(tender);
    if (activeTab === 'tenders') {
      setIsTenderModalOpen(true);
    } else {
      setIsSubmissionModalOpen(true);
    }
  };

  const handleDownloadExcel = () => {
    const headers = [
      "Tender Number", "Month", "Tender Type", "Customer Name", "Contact Name", 
      "Mobile Number", "Email ID", "Tender Name", "Tender Value", "Publish Date", "Last Date",
      "Submission Date", "Quote Value", "EMD Value", "BG Value", "Zone", "Branch Manager",
      "Status", "PO Number", "Order Value", "Remarks"
    ];
    
    const rows = filteredTenders.map(t => [
      t.tenderNumber || '', t.month || '', t.tenderType || '', t.customerName || '', t.contactName || '',
      t.mobileNumber || '', t.emailId || '', t.tenderName || '', t.tenderValue || '', t.tenderPublishDate || '', t.tenderLastDate || '',
      t.tenderSubmissionDate || '', t.tenderQuoteValue || '', t.emdValue || '', t.bgValue || '', t.zone || '', t.branchManager || '',
      t.tenderStatus || '', t.poNumber || '', t.orderValue || '', t.remarks || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Tenders_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent, type: 'create' | 'update') => {
    e.preventDefault();
    try {
      // If we're updating, or if we're creating but have an ID (which means we opened edit mode in Add Tender)
      const isUpdate = (type === 'update') || !!formData._id;
      
      const url = isUpdate 
        ? `http://${window.location.hostname}:5000/api/tenders/${formData._id}` 
        : `http://${window.location.hostname}:5000/api/tenders`;
      
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsTenderModalOpen(false);
        setIsSubmissionModalOpen(false);
        setFormData({});
        fetchTenders();
      }
    } catch (err) {
      console.error('Failed to save tender');
    }
  };

  const filteredTenders = tenders.filter(t => {
    const matchesSearch = t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.tenderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.tenderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (fromDate || toDate) {
      const dateToCompare = t.tenderPublishDate || t.month;
      if (dateToCompare) {
        const d = new Date(dateToCompare);
        if (fromDate && d < new Date(fromDate)) matchesDate = false;
        if (toDate && d > new Date(toDate)) matchesDate = false;
      } else {
        matchesDate = false;
      }
    }
    return matchesSearch && matchesDate;
  });

  return (
    <>
      <div className="page-header" style={{ marginBottom: '15px' }}>
        <div>
          <h1 className="page-title">Tenders Management</h1>
          <div className="page-subtitle">Manage tender details and submissions</div>
        </div>
        <div className="controls-row">
          <button className="btn" style={{ background: '#10b981', color: 'white' }} onClick={handleDownloadExcel}>↓ Download Excel</button>
          {activeTab === 'tenders' ? (
            <button className="btn btn-primary" onClick={() => { setFormData({}); setIsTenderModalOpen(true); }}>+ Add Tender</button>
          ) : (
            <button className="btn btn-primary" onClick={() => { setFormData({}); setIsSubmissionModalOpen(true); }}>+ Add Submission</button>
          )}
          <button className="btn" onClick={fetchTenders}>↻ Refresh</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid var(--border-color)', marginBottom: '20px' }}>
        <button 
          style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'tenders' ? '2px solid var(--accent)' : 'none', color: activeTab === 'tenders' ? 'var(--accent)' : '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: '-2px' }}
          onClick={() => setActiveTab('tenders')}
        >
          Add Tender View
        </button>
        <button 
          style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'submissions' ? '2px solid var(--accent)' : 'none', color: activeTab === 'submissions' ? 'var(--accent)' : '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: '-2px' }}
          onClick={() => setActiveTab('submissions')}
        >
          Tender Submissions View
        </button>
      </div>

      <div className="table-card">
        <div className="filter-bar" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ background: 'white', border: '1px solid var(--border-color)', width: '250px' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>From:</span>
            <input type="date" style={{ border: 'none', outline: 'none', fontSize: '0.9rem' }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>To:</span>
            <input type="date" style={{ border: 'none', outline: 'none', fontSize: '0.9rem' }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
            <button onClick={() => { setFromDate(''); setToDate(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Clear</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'tenders' && (
            <table style={{ minWidth: '1600px' }}>
              <thead>
                <tr>
                  <th>Tender No</th>
                  <th>Month</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Value</th>
                  <th>Publish Date</th>
                  <th>Last Date</th>
                  <th>Docs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenders.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 600 }}>{t.tenderNumber || '--'}</td>
                    <td>{t.month ? new Date(t.month).toLocaleDateString(undefined, {month: 'short', year: 'numeric'}) : '--'}</td>
                    <td><span className="status-badge renewal">{t.tenderType === 'OTHERS' ? t.otherTenderType : t.tenderType || '--'}</span></td>
                    <td style={{ fontWeight: 500 }}>{t.customerName || '--'}</td>
                    <td>{t.contactName}<br/><span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{t.mobileNumber}</span></td>
                    <td>₹{t.tenderValue || 0}</td>
                    <td>{t.tenderPublishDate ? new Date(t.tenderPublishDate).toLocaleDateString() : '--'}</td>
                    <td>{t.tenderLastDate ? new Date(t.tenderLastDate).toLocaleDateString() : '--'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {t.tenderDocument && <a href={t.tenderDocument} download="Tender_Doc.pdf" style={{ textDecoration: 'none', cursor: 'pointer', color: '#3b82f6' }} title="Tender Doc">📄</a>}
                        {t.boqDocument && <a href={t.boqDocument} download="BOQ.pdf" style={{ textDecoration: 'none', cursor: 'pointer', color: '#10b981' }} title="BOQ">📄</a>}
                        {t.annexure1 && <a href={t.annexure1} download="Annexure1.pdf" style={{ textDecoration: 'none', cursor: 'pointer', color: '#8b5cf6' }} title="Annexure 1">📄</a>}
                        {t.annexure2 && <a href={t.annexure2} download="Annexure2.pdf" style={{ textDecoration: 'none', cursor: 'pointer', color: '#8b5cf6' }} title="Annexure 2">📄</a>}
                        {t.annexure3 && <a href={t.annexure3} download="Annexure3.pdf" style={{ textDecoration: 'none', cursor: 'pointer', color: '#8b5cf6' }} title="Annexure 3">📄</a>}
                        {(!t.tenderDocument && !t.boqDocument && !t.annexure1 && !t.annexure2 && !t.annexure3) && <span style={{ color: 'var(--text-muted)' }}>--</span>}
                      </div>
                    </td>
                    <td>
                      <button className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleEdit(t)}>Edit</button>
                    </td>
                  </tr>
                ))}
                {filteredTenders.length === 0 && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}><div style={{ color: 'var(--text-muted)' }}>No tenders found.</div></td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'submissions' && (
            <table style={{ minWidth: '1800px' }}>
              <thead>
                <tr>
                  <th>Tender No</th>
                  <th>Sub. Date</th>
                  <th>Quote Value</th>
                  <th>EMD Value</th>
                  <th>BG</th>
                  <th>Zone</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>PO No</th>
                  <th>Order Value</th>
                  <th>Docs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenders.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 600 }}>{t.tenderNumber || '--'}<br/><span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{t.tenderName}</span></td>
                    <td>{t.tenderSubmissionDate ? new Date(t.tenderSubmissionDate).toLocaleDateString() : '--'}</td>
                    <td>₹{t.tenderQuoteValue || 0}</td>
                    <td>₹{t.emdValue || 0}</td>
                    <td>{t.bgValue === 'Yes' ? 'Yes' : 'No'}</td>
                    <td>{t.zone || '--'}</td>
                    <td>{t.branchManager || '--'}</td>
                    <td><span className={`status-badge ${t.tenderStatus === 'Inprogress' ? 'renewal' : ''}`}>{t.tenderStatus || 'Pending'}</span></td>
                    <td>{t.poNumber || '--'}</td>
                    <td>₹{t.orderValue || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {t.subTenderDocument && <a href={t.subTenderDocument} download="Sub_Tender_Doc.pdf" style={{ textDecoration: 'none', cursor: 'pointer', color: '#f59e0b' }} title="Tender Doc">🔗</a>}
                        {t.subEmdDocument && <a href={t.subEmdDocument} download="EMD_Doc.pdf" style={{ textDecoration: 'none', cursor: 'pointer', color: '#f59e0b' }} title="EMD Doc">🔗</a>}
                        {t.subBgDocument && <a href={t.subBgDocument} download="BG_Doc.pdf" style={{ textDecoration: 'none', cursor: 'pointer', color: '#f59e0b' }} title="BG Doc">🔗</a>}
                        {t.subOtherDocuments && <a href={t.subOtherDocuments} download="Other_Docs.pdf" style={{ textDecoration: 'none', cursor: 'pointer', color: '#f59e0b' }} title="Other Docs">🔗</a>}
                        {(!t.subTenderDocument && !t.subEmdDocument && !t.subBgDocument && !t.subOtherDocuments) && <span style={{ color: 'var(--text-muted)' }}>--</span>}
                      </div>
                    </td>
                    <td>
                      <button className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleEdit(t)}>Edit</button>
                    </td>
                  </tr>
                ))}
                {filteredTenders.length === 0 && (
                  <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px' }}><div style={{ color: 'var(--text-muted)' }}>No submissions found.</div></td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* TENDER DETAILS MODAL (PART 1) */}
      {isTenderModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>{formData._id ? 'Edit Tender Details' : 'Add Tender Details'}</h3>
            <form onSubmit={(e) => handleSubmit(e, 'create')}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group"><label className="form-label">Tender Number *</label><input type="text" name="tenderNumber" className="filter-input" style={{width: '100%'}} value={formData.tenderNumber || ''} onChange={handleInputChange} required /></div>
                <div className="form-group"><label className="form-label">Month</label><input type="date" name="month" className="filter-input" style={{width: '100%'}} value={formData.month?.substring(0,10) || ''} onChange={handleInputChange} /></div>
                
                <div className="form-group">
                  <label className="form-label">Tender Type</label>
                  <select name="tenderType" className="filter-input" style={{width: '100%'}} value={formData.tenderType || ''} onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="AMC">AMC</option>
                    <option value="PARTS">PARTS</option>
                    <option value="RECD">RECD</option>
                    <option value="AMC-PARTS">AMC-PARTS</option>
                    <option value="OTHERS">OTHERS</option>
                  </select>
                </div>
                {formData.tenderType === 'OTHERS' && (
                  <div className="form-group"><label className="form-label">Specify Other Type</label><input type="text" name="otherTenderType" className="filter-input" style={{width: '100%'}} value={formData.otherTenderType || ''} onChange={handleInputChange} /></div>
                )}
                
                <div className="form-group"><label className="form-label">Customer Name *</label><input type="text" name="customerName" className="filter-input" style={{width: '100%'}} value={formData.customerName || ''} onChange={handleInputChange} required /></div>
                <div className="form-group"><label className="form-label">Contact Name</label><input type="text" name="contactName" className="filter-input" style={{width: '100%'}} value={formData.contactName || ''} onChange={handleInputChange} /></div>
                
                <div className="form-group"><label className="form-label">Mobile Number</label><input type="text" name="mobileNumber" className="filter-input" style={{width: '100%'}} value={formData.mobileNumber || ''} onChange={handleInputChange} /></div>
                <div className="form-group"><label className="form-label">Email ID</label><input type="email" name="emailId" className="filter-input" style={{width: '100%'}} value={formData.emailId || ''} onChange={handleInputChange} /></div>
                
                <div className="form-group"><label className="form-label">Tender Name</label><input type="text" name="tenderName" className="filter-input" style={{width: '100%'}} value={formData.tenderName || ''} onChange={handleInputChange} /></div>
                <div className="form-group"><label className="form-label">Tender Web Link</label><input type="text" name="tenderWebLink" className="filter-input" style={{width: '100%'}} value={formData.tenderWebLink || ''} onChange={handleInputChange} /></div>
                
                <div className="form-group"><label className="form-label">Tender Value</label><input type="number" name="tenderValue" className="filter-input" style={{width: '100%'}} value={formData.tenderValue || ''} onChange={handleInputChange} /></div>
                <div className="form-group"><label className="form-label">Publish Date</label><input type="date" name="tenderPublishDate" className="filter-input" style={{width: '100%'}} value={formData.tenderPublishDate?.substring(0,10) || ''} onChange={handleInputChange} /></div>
                
                <div className="form-group"><label className="form-label">Last Date</label><input type="date" name="tenderLastDate" className="filter-input" style={{width: '100%'}} value={formData.tenderLastDate?.substring(0,10) || ''} onChange={handleInputChange} /></div>

                <div className="form-group"><label className="form-label">Bid Offer Validity (From End Date)</label><input type="text" name="bidOfferValidity" className="filter-input" style={{width: '100%'}} value={formData.bidOfferValidity || ''} onChange={handleInputChange} /></div>
                <div className="form-group"><label className="form-label">Location</label><input type="text" name="location" className="filter-input" style={{width: '100%'}} value={formData.location || ''} onChange={handleInputChange} /></div>
                
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select name="branch" className="filter-input" style={{width: '100%'}} value={formData.branch || ''} onChange={handleInputChange}>
                    <option value="">Select Branch</option>
                    <option value="Balangar">Balangar</option>
                    <option value="HI-Tech City">HI-Tech City</option>
                    <option value="Naryanguda">Naryanguda</option>
                    <option value="Uppal">Uppal</option>
                    <option value="Suryapet">Suryapet</option>
                    <option value="Khatedan">Khatedan</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Item Category/Description</label><input type="text" name="itemCategory" className="filter-input" style={{width: '100%'}} value={formData.itemCategory || ''} onChange={handleInputChange} /></div>

                <div className="form-group"><label className="form-label">Contract Period</label><input type="text" name="contractPeriod" className="filter-input" style={{width: '100%'}} value={formData.contractPeriod || ''} onChange={handleInputChange} /></div>
                <div className="form-group"><label className="form-label">Minimum Average Annual Turnover</label><input type="text" name="minAnnualTurnover" className="filter-input" style={{width: '100%'}} value={formData.minAnnualTurnover || ''} onChange={handleInputChange} /></div>

                <div className="form-group">
                  <label className="form-label">Experience of Similar Services required</label>
                  <select name="experienceRequired" className="filter-input" style={{width: '100%'}} value={formData.experienceRequired || ''} onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Document required from seller</label><input type="text" name="docsRequired" className="filter-input" style={{width: '100%'}} value={formData.docsRequired || ''} onChange={handleInputChange} /></div>

                <div className="form-group">
                  <label className="form-label">Type of Bid</label>
                  <select name="bidType" className="filter-input" style={{width: '100%'}} value={formData.bidType || ''} onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Single Bid">Single Bid</option>
                    <option value="Two Packet Bid">Two Packet Bid</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">EMD</label>
                  <select name="emdRequired" className="filter-input" style={{width: '100%'}} value={formData.emdRequired || ''} onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                
                {formData.emdRequired === 'YES' && (
                  <div className="form-group"><label className="form-label">EMD VALUE</label><input type="number" name="emdValue" className="filter-input" style={{width: '100%'}} value={formData.emdValue || ''} onChange={handleInputChange} /></div>
                )}
                
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Tender Remarks</label><textarea name="tenderRemarks" className="filter-input" style={{width: '100%', height: '60px'}} value={formData.tenderRemarks || ''} onChange={handleInputChange}></textarea></div>
                
                {/* File Uploads for Add Tender */}
                <div className="form-group" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}><h4 style={{marginBottom: '15px'}}>Attachments (PDF Only)</h4></div>
                <div className="form-group"><label className="form-label">1. TENDER DOCUMENT</label><input type="file" accept=".pdf" className="filter-input" style={{width: '100%'}} onChange={(e) => handleFileUpload(e, 'tenderDocument')} />{formData.tenderDocument && <span style={{fontSize: '0.8rem', color: 'green'}}>File uploaded</span>}</div>
                <div className="form-group"><label className="form-label">2. BOQ</label><input type="file" accept=".pdf" className="filter-input" style={{width: '100%'}} onChange={(e) => handleFileUpload(e, 'boqDocument')} />{formData.boqDocument && <span style={{fontSize: '0.8rem', color: 'green'}}>File uploaded</span>}</div>
                <div className="form-group"><label className="form-label">3. ANNEXURE-1</label><input type="file" accept=".pdf" className="filter-input" style={{width: '100%'}} onChange={(e) => handleFileUpload(e, 'annexure1')} />{formData.annexure1 && <span style={{fontSize: '0.8rem', color: 'green'}}>File uploaded</span>}</div>
                <div className="form-group"><label className="form-label">4. ANNEXURE-2</label><input type="file" accept=".pdf" className="filter-input" style={{width: '100%'}} onChange={(e) => handleFileUpload(e, 'annexure2')} />{formData.annexure2 && <span style={{fontSize: '0.8rem', color: 'green'}}>File uploaded</span>}</div>
                <div className="form-group"><label className="form-label">5. ANNEXURE-3</label><input type="file" accept=".pdf" className="filter-input" style={{width: '100%'}} onChange={(e) => handleFileUpload(e, 'annexure3')} />{formData.annexure3 && <span style={{fontSize: '0.8rem', color: 'green'}}>File uploaded</span>}</div>

              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setIsTenderModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Tender</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TENDER SUBMISSION MODAL (PART 2) */}
      {isSubmissionModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>{formData._id ? 'Edit Tender Submission' : 'Add Tender Submission'}</h3>
            <form onSubmit={(e) => handleSubmit(e, 'update')}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Search / Select Tender Number</label>
                  <select name="tenderId" className="filter-input" style={{width: '100%'}} onChange={handleTenderSelect} value={formData._id || ''} required>
                    <option value="">-- Select Tender --</option>
                    {tenders.map(t => (
                      <option key={t._id} value={t._id}>{t.tenderNumber} - {t.tenderName}</option>
                    ))}
                  </select>
                </div>
                
                {formData._id && (
                  <>
                    <div className="form-group"><label className="form-label">Submission Date</label><input type="date" name="tenderSubmissionDate" className="filter-input" style={{width: '100%'}} value={formData.tenderSubmissionDate?.substring(0,10) || ''} onChange={handleInputChange} /></div>
                    <div className="form-group"><label className="form-label">Tender Quote Value</label><input type="number" name="tenderQuoteValue" className="filter-input" style={{width: '100%'}} value={formData.tenderQuoteValue || ''} onChange={handleInputChange} /></div>
                    
                    <div className="form-group"><label className="form-label">Quote Valid Upto</label><input type="date" name="quoteValidUpto" className="filter-input" style={{width: '100%'}} value={formData.quoteValidUpto?.substring(0,10) || ''} onChange={handleInputChange} /></div>
                    <div className="form-group"><label className="form-label">EMD Value</label><input type="number" name="emdValue" className="filter-input" style={{width: '100%'}} value={formData.emdValue || ''} onChange={handleInputChange} /></div>
                    
                    <div className="form-group"><label className="form-label">EMD Details</label><input type="text" name="emdDetails" className="filter-input" style={{width: '100%'}} value={formData.emdDetails || ''} onChange={handleInputChange} /></div>
                    <div className="form-group">
                      <label className="form-label">BG Value (Yes/No)</label>
                      <select name="bgValue" className="filter-input" style={{width: '100%'}} value={formData.bgValue || ''} onChange={handleInputChange}>
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    {formData.bgValue === 'Yes' && (
                      <>
                        <div className="form-group"><label className="form-label">BG Number</label><input type="text" name="bgNumber" className="filter-input" style={{width: '100%'}} value={formData.bgNumber || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label className="form-label">BG Bank Name</label><input type="text" name="bgBankName" className="filter-input" style={{width: '100%'}} value={formData.bgBankName || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label className="form-label">BG Branch</label><input type="text" name="bgBranch" className="filter-input" style={{width: '100%'}} value={formData.bgBranch || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label className="form-label">BG Valid From</label><input type="date" name="bgValidFrom" className="filter-input" style={{width: '100%'}} value={formData.bgValidFrom?.substring(0,10) || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label className="form-label">BG Valid End Date</label><input type="date" name="bgValidEnd" className="filter-input" style={{width: '100%'}} value={formData.bgValidEnd?.substring(0,10) || ''} onChange={handleInputChange} /></div>
                      </>
                    )}
                    
                    <div className="form-group">
                      <label className="form-label">Zone</label>
                      <select name="zone" className="filter-input" style={{width: '100%'}} value={formData.zone || ''} onChange={handleInputChange}>
                        <option value="">Select</option>
                        <option value="H1">H1</option>
                        <option value="H2">H2</option>
                        <option value="H3">H3</option>
                        <option value="H4">H4</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Branch Manager</label><input type="text" name="branchManager" className="filter-input" style={{width: '100%'}} value={formData.branchManager || ''} onChange={handleInputChange} /></div>
                    
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select name="tenderStatus" className="filter-input" style={{width: '100%'}} value={formData.tenderStatus || ''} onChange={handleInputChange}>
                        <option value="Pending">Pending</option>
                        <option value="Inprogress">Inprogress</option>
                        <option value="Order">Order</option>
                        <option value="Order Not Received">Order Not Received</option>
                        <option value="Tender Cancel">Tender Cancel</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">PO Number</label><input type="text" name="poNumber" className="filter-input" style={{width: '100%'}} value={formData.poNumber || ''} onChange={handleInputChange} /></div>
                    
                    <div className="form-group"><label className="form-label">PO Date</label><input type="date" name="poDate" className="filter-input" style={{width: '100%'}} value={formData.poDate?.substring(0,10) || ''} onChange={handleInputChange} /></div>
                    <div className="form-group"><label className="form-label">Order Value</label><input type="number" name="orderValue" className="filter-input" style={{width: '100%'}} value={formData.orderValue || ''} onChange={handleInputChange} /></div>

                    <div className="form-group"><label className="form-label">Contract Valid From</label><input type="date" name="contractValidFrom" className="filter-input" style={{width: '100%'}} value={formData.contractValidFrom?.substring(0,10) || ''} onChange={handleInputChange} /></div>
                    <div className="form-group"><label className="form-label">Contract Valid End</label><input type="date" name="contractValidEnd" className="filter-input" style={{width: '100%'}} value={formData.contractValidEnd?.substring(0,10) || ''} onChange={handleInputChange} /></div>
                    
                    <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Remarks</label><textarea name="remarks" className="filter-input" style={{width: '100%', height: '60px'}} value={formData.remarks || ''} onChange={handleInputChange}></textarea></div>
                    
                    {/* File Uploads */}
                    <div className="form-group" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}><h4 style={{marginBottom: '15px'}}>Attachments (PDF Only)</h4></div>
                    <div className="form-group"><label className="form-label">Tender Documents</label><input type="file" accept=".pdf" className="filter-input" style={{width: '100%'}} onChange={(e) => handleFileUpload(e, 'subTenderDocument')} />{formData.subTenderDocument && <span style={{fontSize: '0.8rem', color: 'green'}}>File uploaded</span>}</div>
                    <div className="form-group"><label className="form-label">EMD Document</label><input type="file" accept=".pdf" className="filter-input" style={{width: '100%'}} onChange={(e) => handleFileUpload(e, 'subEmdDocument')} />{formData.subEmdDocument && <span style={{fontSize: '0.8rem', color: 'green'}}>File uploaded</span>}</div>
                    <div className="form-group"><label className="form-label">Bank Gurantee Document</label><input type="file" accept=".pdf" className="filter-input" style={{width: '100%'}} onChange={(e) => handleFileUpload(e, 'subBgDocument')} />{formData.subBgDocument && <span style={{fontSize: '0.8rem', color: 'green'}}>File uploaded</span>}</div>
                    <div className="form-group"><label className="form-label">Other Documents</label><input type="file" accept=".pdf" className="filter-input" style={{width: '100%'}} onChange={(e) => handleFileUpload(e, 'subOtherDocuments')} />{formData.subOtherDocuments && <span style={{fontSize: '0.8rem', color: 'green'}}>File uploaded</span>}</div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setIsSubmissionModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!formData._id}>Save Submission</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
