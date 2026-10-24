import { useEffect, useState } from 'react';
import { request } from '../services/api.js';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Ask about sales drops, top products, failed payments, or investigation priorities.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await request('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.text })
      });

      setMessages((prev) => [...prev, { sender: 'bot', text: result.answer || 'No answer returned.' }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: `AI is unavailable: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card panel stack">
      <h3>AI merchant chat</h3>
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: '1fr auto' }}>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the AI about your business..." />
        <button className="primary-btn" onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
