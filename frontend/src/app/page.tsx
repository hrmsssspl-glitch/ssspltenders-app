'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, organization: 'ssspl enterprise realm' }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error, please try again later.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="left-content">
          <div className="logo-placeholder">PSense CRM</div>
          <h1 className="main-heading">The Complete CRM for Field Service Excellence</h1>
          <p className="sub-heading">Lead-to-Cash and Field Service Management for Srinivasa Sales and Service Pvt. Ltd. — Authorized Cummins Partner.</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3>Interaction-Native</h3>
              <p>Every call, email, and document becomes structured operational evidence.</p>
            </div>
            <div className="feature-card">
              <h3>Service-First Delivery</h3>
              <p>Built for expert field service execution and quick parts turnaround.</p>
            </div>
            <div className="feature-card">
              <h3>Equipment Expertise</h3>
              <p>Aligned for compressors, pumps, diesel engines, and concrete equipment.</p>
            </div>
            <div className="feature-card">
              <h3>RBAC by Hierarchy</h3>
              <p>Role and org scope determine exactly what each persona can access.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-card">
          <p className="realm-text">SSSPL ENTERPRISE REALM</p>
          <div className="company-logo">Srinivasa Sales and Service Pvt. Ltd.</div>
          <h2>Sign in to your account</h2>
          <p className="subtitle">Select your organization to continue</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Organization / Region</label>
              <select className="login-input">
                <option>ssspl enterprise realm</option>
              </select>
            </div>
            <div className="form-group">
              <label>User ID</label>
              <input 
                type="text" 
                className="login-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="User ID"
                autoComplete="username"
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="login-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required 
              />
            </div>
            <button type="submit" className="login-btn">Sign In</button>
          </form>
          
          <div className="register-link">
            <span>New customer? </span>
            <a href="#">Register as Customer</a>
          </div>
        </div>
      </div>
    </div>
  );
}
