import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/cakesData';
import './WhatsAppChat.css';

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    const text = userMsg.trim() || 'Hello Lany Cake Shop! I would like to inquire about ordering a cake.';
    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setUserMsg('');
  };

  return (
    <div className="wa-floating-container">
      {isOpen && (
        <div className="wa-chat-window">
          <div className="wa-chat-header">
            <div className="wa-chat-agent">
              <div className="wa-avatar">
                <img src="/images/lany/cj-cakes.webp" alt="Carol Jenny" />
                <span className="wa-status-dot"></span>
              </div>
              <div className="wa-agent-info">
                <strong>Carol Jenny • Lany Cakes</strong>
                <span>Online • Usually replies in minutes</span>
              </div>
            </div>
            <button className="wa-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          <div className="wa-chat-body">
            <div className="wa-bubble incoming">
              <p>Habari! Welcome to <strong>Lany Cake Shop Nairobi</strong>.</p>
              <p>Looking for a birthday cake, wedding cake, or custom design? How can we sweeten your celebration today?</p>
              <span className="wa-time">Just now</span>
            </div>
          </div>

          <form className="wa-chat-footer" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type your cake inquiry..."
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              className="wa-input"
            />
            <button type="submit" className="wa-send-btn" aria-label="Send to WhatsApp">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button 
        className="wa-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat with Lany Cakes on WhatsApp"
      >
        <MessageCircle size={28} />
        <span className="wa-floating-tooltip">Chat with us!</span>
      </button>
    </div>
  );
}
