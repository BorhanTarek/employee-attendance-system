import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('admin@company.com');
  const [password, setPassword] = useState('adminpassword123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #009aa6 0%, #00c897 100%)',
            color: '#04141c',
            fontWeight: '900',
            fontSize: '1.4rem',
            marginBottom: '14px',
            boxShadow: '0 4px 20px rgba(0, 200, 151, 0.4)'
          }}>
            RATP
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '6px' }}>GeoAttend</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>RATP Dev Workforce Operations Portal</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Email or Employee ID
            </label>
            <input
              type="text"
              className="glass-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. admin@company.com"
              required
            />
          </div>

          <div style={{ marginBottom: '26px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>

        <div style={{ marginTop: '26px', padding: '14px', background: 'rgba(0, 154, 166, 0.08)', borderRadius: '12px', border: '1px solid rgba(0, 154, 166, 0.2)', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          💡 Default Credentials: <b style={{ color: '#00c897' }}>admin@company.com</b> / <b style={{ color: '#00c897' }}>adminpassword123</b>
        </div>
      </div>
    </div>
  );
}
