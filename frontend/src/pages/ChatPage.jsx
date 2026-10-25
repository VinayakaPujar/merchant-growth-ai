import { useEffect, useState } from 'react';
import { request } from '../services/api.js';
import { Mic } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Ask about sales drops, top products, failed payments, or investigation priorities. You can also use voice input.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

  useEffect(() => {
    const seed = window.localStorage.getItem('merchant-growth-ai-chat-seed');
    if (seed) {
      setInput(seed);
      window.localStorage.removeItem('merchant-growth-ai-chat-seed');
    }
  }, []);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => handleSendWithText(transcript), 250);
    };

    recognition.start();
  };

  const handleSendWithText = async (text) => {
    if (!text || !text.trim()) return;
    const userMessage = { sender: 'user', text: text.trim() };
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

      <div className="form-grid" style={{ gridTemplateColumns: '1fr auto auto' }}>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the AI about your business..." />
        <button className="secondary-btn" onClick={handleVoiceInput} disabled={isListening}>
          <Mic size={16} /> {isListening ? 'Listening...' : 'Voice'}
        </button>
        <button className="primary-btn" onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
