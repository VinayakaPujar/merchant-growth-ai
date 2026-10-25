import { useState } from 'react';
import { request } from '../services/api.js';

export default function ReceiptUploadModal({ isOpen, onClose, onSaved }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleScan = async () => {
    if (!selectedFile) {
      setError('Please choose a receipt image first.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const payload = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/receipts/scan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('merchant-growth-ai-token') || ''}`
        },
        body: formData
      }).then((res) => res.json());

      setResult(payload);
      if (payload?.vendorName) {
        onSaved && onSaved(payload);
      }
    } catch (err) {
      setError(err.message || 'Receipt scan failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Upload receipt</h3>
        <input className="input" type="file" accept="image/png,image/jpeg" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
        {error && <div className="alert">{error}</div>}
        {result && (
          <div className="card panel" style={{ marginTop: 14 }}>
            <p><strong>Vendor:</strong> {result.vendorName}</p>
            <p><strong>Total:</strong> ₹{Number(result.totalAmount || 0).toLocaleString('en-IN')}</p>
            <p><strong>Date:</strong> {result.date}</p>
            <ul>
              {(result.items || []).map((item, idx) => (
                <li key={idx}>{item.name} x {item.quantity} — ₹{Number(item.price || 0).toLocaleString('en-IN')}</li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="secondary-btn" onClick={onClose}>Close</button>
          <button className="primary-btn" onClick={handleScan} disabled={loading}>{loading ? 'Scanning...' : 'Scan Receipt'}</button>
        </div>
      </div>
    </div>
  );
}
