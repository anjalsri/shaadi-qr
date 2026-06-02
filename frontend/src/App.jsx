import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  QrCode, Image as ImageIcon, Video, Heart, Calendar, MapPin, 
  Download, Trash2, Check, X, Shield, Users, Database, 
  IndianRupee, Lock, Eye, EyeOff, Share2, Plus, ArrowRight, BarChart2,
  FileText, LogOut, Loader2, Sparkles, Phone, Mail, User as UserIcon, MessageSquare
} from 'lucide-react';
import { api } from './api';

// ==========================================
// TOAST AND GLOBAL HELPERS
// ==========================================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-4 rounded-radius shadow-xl animate-bounce text-sm font-semibold transition-all duration-300 ${
      type === 'error' ? 'bg-maroon-dark text-gold-light border border-gold/30' : 'bg-gold text-maroon-dark'
    }`}>
      {type === 'error' ? <X size={18} /> : <Check size={18} />}
      <span>{message}</span>
    </div>
  );
};

// ==========================================
// CAPTCHA GENERATOR
// ==========================================
const generateMathCaptcha = () => {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  return {
    question: `${num1} ${op} ${num2}`,
    answer: op === '+' ? num1 + num2 : (op === '-' ? num1 - num2 : num1 * num2)
  };
};

// ==========================================
// COMPONENT: NAVIGATION BAR
// ==========================================
const Navigation = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-maroon-dark text-white border-b border-gold/20 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
      <div className="flex items-center gap-2 text-gold-light font-serif font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>
        <span className="text-2xl animate-pulse-gold">🪬</span>
        <span>Shaadi QR</span>
      </div>
      
      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="hover:text-gold transition">Home</Link>
        <Link to="/pricing" className="hover:text-gold transition">Pricing</Link>
        <Link to="/about" className="hover:text-gold transition">About</Link>
        <Link to="/contact" className="hover:text-gold transition">Contact</Link>
        {user && user.role === 'admin' && (
          <Link to="/admin" className="text-gold hover:text-gold-light transition font-semibold">Admin Panel</Link>
        )}
        {user && (
          <Link to="/dashboard" className="text-gold-light hover:text-gold transition font-semibold">Dashboard</Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-cream/70 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              {user.username} ({user.role})
            </span>
            <button 
              onClick={onLogout} 
              className="flex items-center gap-1.5 bg-white/10 text-white hover:bg-maroon-light px-4 py-2 rounded-radius-sm text-xs font-semibold border border-white/20 transition"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="bg-transparent hover:text-gold text-white px-4 py-2 text-xs font-semibold transition">
              Login
            </Link>
            <Link to="/register" className="bg-gold text-maroon-dark hover:bg-gold-light px-4 py-2 rounded-radius-sm text-xs font-bold transition shadow-md">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// ==========================================
// PAGE: LANDING PAGE
// ==========================================
const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="luxury-gradient text-white py-20 px-6 md:px-12 relative overflow-hidden flex flex-col items-center text-center md:text-left md:flex-row md:justify-between gap-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(201,168,76,0.15),transparent_40%)]" />
        <div className="max-w-xl space-y-6 z-10">
          <div className="inline-block bg-gold/15 border border-gold/40 text-gold-light px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
            ✦ India's Wedding Memory QR Platform
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white font-bold leading-tight">
            Collect Every <br className="hidden md:inline" />
            Wedding Moment <br />
            <span className="text-gold-light italic">With One Beautiful QR</span>
          </h1>
          <p className="text-cream/80 text-base leading-relaxed max-w-lg">
            No app downloads, no login, no friction. Guests scan and upload photos, videos, and blessings in seconds. Keep your celebrations completely private, secure, and preserved forever.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button onClick={() => navigate('/register')} className="bg-gold text-maroon-dark hover:bg-gold-light px-8 py-3.5 rounded-radius font-bold text-sm transition shadow-lg animate-glow">
              Create My Wedding Album
            </button>
            <button onClick={() => navigate('/pricing')} className="bg-transparent text-white border border-white/40 hover:border-gold hover:text-gold px-8 py-3.5 rounded-radius text-sm font-semibold transition">
              Explore Pricing Plans
            </button>
          </div>
          <div className="flex gap-6 pt-4 text-xs text-cream/70">
            <span className="flex items-center gap-1">🔒 100% Private Gallery</span>
            <span className="flex items-center gap-1">📲 No App Required</span>
            <span className="flex items-center gap-1">⚡ Dynamic Customized QR</span>
          </div>
        </div>

        {/* Hero Illustration Showcase */}
        <div className="relative z-10 w-full max-w-sm flex items-center justify-center">
          <div className="absolute -left-12 top-10 bg-white/95 text-maroon-dark border border-gold/30 p-4 rounded-radius shadow-2xl z-20 animate-float hidden sm:block">
            <div className="text-2xl font-serif font-bold text-maroon">954+</div>
            <div className="text-[10px] text-ink-muted font-medium">Guest uploads collected</div>
          </div>
          
          <div className="bg-white/10 border border-white/20 p-4 rounded-[40px] shadow-3xl backdrop-blur-md transform rotate-3 max-w-[280px]">
            <div className="bg-cream rounded-[28px] overflow-hidden text-ink shadow-inner min-h-[380px] w-[240px] flex flex-col justify-between p-4">
              <div className="bg-gradient-to-r from-maroon to-maroon-dark p-4 rounded-radius text-white text-center font-serif text-sm font-bold shadow-md">
                Priya ♡ Arjun
                <div className="text-[9px] font-sans font-normal opacity-80 mt-1">Wedding Album</div>
              </div>
              <div className="border-2 border-dashed border-cream-dark p-6 rounded-radius text-center text-ink-muted text-xs bg-white shadow-sm flex flex-col items-center gap-3">
                <span className="text-3xl animate-bounce">📸</span>
                <span>Tap to Upload Photos & Videos</span>
                <span className="text-[9px] text-gray-400">Max size: 100MB</span>
              </div>
              <div className="bg-gold text-maroon-dark text-center py-2.5 rounded-radius font-bold text-[10px] shadow-sm uppercase tracking-wider">
                ⬇ Download Full Album
              </div>
            </div>
          </div>

          <div className="absolute -right-6 bottom-10 bg-white/95 text-maroon-dark border border-gold/30 p-4 rounded-radius shadow-2xl z-20 hidden sm:block">
            <div className="text-gold-dark font-bold text-center">Scan QR Code</div>
            <div className="text-[10px] text-ink-muted font-medium mt-1">Upload → Save → Bless</div>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="px-6 py-6 bg-white border-y border-cream-dark">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 border-r border-cream-dark last:border-none">
            <div className="font-serif text-2xl font-bold text-maroon">2 Minutes</div>
            <div className="text-xs text-ink-muted mt-1">Self Signup Setup</div>
          </div>
          <div className="p-4 border-r border-cream-dark last:border-none">
            <div className="font-serif text-2xl font-bold text-maroon">Unlimited</div>
            <div className="text-xs text-ink-muted mt-1">Guest Blessings & Uploads</div>
          </div>
          <div className="p-4 border-r border-cream-dark last:border-none">
            <div className="font-serif text-2xl font-bold text-maroon">High Quality</div>
            <div className="text-xs text-ink-muted mt-1">ZIP / Invoice Download</div>
          </div>
          <div className="p-4 last:border-none">
            <div className="font-serif text-2xl font-bold text-maroon">Custom Themes</div>
            <div className="text-xs text-ink-muted mt-1">Stunning Wedding Layouts</div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <div className="text-gold-dark font-semibold text-xs tracking-widest uppercase">Simple & Elegant</div>
        <h2 className="font-serif text-3xl md:text-4xl text-maroon-dark font-bold mt-2">How Shaadi QR Works</h2>
        <p className="text-ink-muted max-w-md mx-auto mt-4 text-sm leading-relaxed">
          From downloading your custom invitation QR to organizing family blessing books, explore how we collect memories.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
          <div className="bg-white p-6 rounded-radius border border-cream-dark relative shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-maroon text-white flex items-center justify-center font-serif font-bold text-lg mx-auto mb-4">1</div>
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-serif font-bold text-maroon-dark text-base">Create Event</h3>
            <p className="text-ink-muted text-xs mt-2 leading-relaxed">Add names, location, date, custom slug, and choose privacy modes.</p>
          </div>
          <div className="bg-white p-6 rounded-radius border border-cream-dark relative shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-maroon text-white flex items-center justify-center font-serif font-bold text-lg mx-auto mb-4">2</div>
            <div className="text-3xl mb-2">📲</div>
            <h3 className="font-serif font-bold text-maroon-dark text-base">Customize & Share QR</h3>
            <p className="text-ink-muted text-xs mt-2 leading-relaxed">Style QR colors, add names, download PNG/PDF, and place on card designs.</p>
          </div>
          <div className="bg-white p-6 rounded-radius border border-cream-dark relative shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-maroon text-white flex items-center justify-center font-serif font-bold text-lg mx-auto mb-4">3</div>
            <div className="text-3xl mb-2">📸</div>
            <h3 className="font-serif font-bold text-maroon-dark text-base">Guests Upload</h3>
            <p className="text-ink-muted text-xs mt-2 leading-relaxed">No registration. Scan QR, write wishes, upload images/videos with spam safeguards.</p>
          </div>
          <div className="bg-white p-6 rounded-radius border border-cream-dark relative shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-maroon text-white flex items-center justify-center font-serif font-bold text-lg mx-auto mb-4">4</div>
            <div className="text-3xl mb-2">💫</div>
            <h3 className="font-serif font-bold text-maroon-dark text-base">Moderate & Store</h3>
            <p className="text-ink-muted text-xs mt-2 leading-relaxed">Review uploads in private dashboard, approve to show publicly, or download as a complete ZIP file.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20 px-6 border-t border-cream-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <span className="text-gold-dark font-semibold text-xs tracking-wider uppercase">Love Stories</span>
            <h2 className="font-serif text-3xl text-maroon-dark font-bold mt-1">What Couples Say About Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-cream p-6 rounded-radius border border-cream-dark shadow-sm">
              <div className="text-gold text-sm mb-3">★★★★★</div>
              <p className="text-ink-muted text-xs italic leading-relaxed">"We collected over 900 photos from 300 guests on our wedding night. Family members loved how simple it was to send photos without using WhatsApp!"</p>
              <div className="font-bold text-maroon-dark text-xs mt-4">Meera & Karthik Nair</div>
              <div className="text-[10px] text-gray-500">Married in Bangalore</div>
            </div>
            <div className="bg-cream p-6 rounded-radius border border-cream-dark shadow-sm">
              <div className="text-gold text-sm mb-3">★★★★★</div>
              <p className="text-ink-muted text-xs italic leading-relaxed">"The customized QR generator matched our card themes perfectly. Moderate features saved us from double uploads. Highly recommended!"</p>
              <div className="font-bold text-maroon-dark text-xs mt-4">Priya & Arjun Sharma</div>
              <div className="text-[10px] text-gray-500">Married in Delhi</div>
            </div>
            <div className="bg-cream p-6 rounded-radius border border-cream-dark shadow-sm">
              <div className="text-gold text-sm mb-3">★★★★★</div>
              <p className="text-ink-muted text-xs italic leading-relaxed">"Downloading the entire digital album as one compiled ZIP saved us days. Visual analytics showing storage and visitors are excellent."</p>
              <div className="font-bold text-maroon-dark text-xs mt-4">Ananya & Rohan Gupta</div>
              <div className="text-[10px] text-gray-500">Married in Mumbai</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ==========================================
// PAGE: PRICING
// ==========================================
const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-gold-dark font-semibold text-xs tracking-wider uppercase">Plans & Packaging</span>
        <h1 className="font-serif text-3xl md:text-4xl text-maroon-dark font-bold mt-2">Transparent Pricing, No Surprises</h1>
        <p className="text-ink-muted text-sm mt-3">Choose the layout limit that fits your guest size. Upgrade at any time from your dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
        {/* Basic Plan */}
        <div className="bg-white rounded-radius border border-cream-dark p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Basic</span>
            <div className="text-3xl font-serif text-maroon font-bold mt-2">₹2,999</div>
            <div className="text-xs text-ink-muted mt-1">Best for close-knit events</div>
            <hr className="my-6 border-cream-dark" />
            <ul className="space-y-3 text-xs text-ink-muted">
              <li className="flex items-center gap-2">✦ 1 Event</li>
              <li className="flex items-center gap-2">✦ 2 GB Cloud Storage</li>
              <li className="flex items-center gap-2">✦ 30 Days Hosting Access</li>
              <li className="flex items-center gap-2">✦ Custom QR Code Design</li>
              <li className="flex items-center gap-2">✦ Public Blessing board</li>
            </ul>
          </div>
          <button onClick={() => navigate('/register')} className="w-full bg-cream border border-gold hover:bg-gold hover:text-maroon-dark text-gold-dark font-bold text-xs py-3 rounded-radius-sm transition mt-8 shadow-sm">
            Get Started
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-white rounded-radius border-2 border-gold p-8 flex flex-col justify-between shadow-xl relative scale-105">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gold text-maroon-dark px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Most Popular
          </div>
          <div>
            <span className="text-xs text-gold-dark font-bold uppercase tracking-wider">Premium</span>
            <div className="text-3xl font-serif text-maroon font-bold mt-2">₹5,999</div>
            <div className="text-xs text-ink-muted mt-1">Perfect for grand celebrations</div>
            <hr className="my-6 border-cream-dark" />
            <ul className="space-y-3 text-xs text-ink-muted font-medium">
              <li className="flex items-center gap-2 text-maroon">✦ 1 Event</li>
              <li className="flex items-center gap-2 text-maroon">✦ 10 GB Cloud Storage</li>
              <li className="flex items-center gap-2 text-maroon">✦ 90 Days Hosting Access</li>
              <li className="flex items-center gap-2">✦ Full Album ZIP Export</li>
              <li className="flex items-center gap-2">✦ Password Protected Gallery</li>
              <li className="flex items-center gap-2">✦ Custom Couple name overlay</li>
              <li className="flex items-center gap-2">✦ Download PDF invoices</li>
            </ul>
          </div>
          <button onClick={() => navigate('/register')} className="w-full bg-gold text-maroon-dark hover:bg-gold-light font-bold text-xs py-3 rounded-radius-sm transition mt-8 shadow-md">
            Purchase Premium
          </button>
        </div>

        {/* Luxury Plan */}
        <div className="bg-white rounded-radius border border-cream-dark p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Luxury</span>
            <div className="text-3xl font-serif text-maroon font-bold mt-2">₹14,999</div>
            <div className="text-xs text-ink-muted mt-1">Multi-event celebrations</div>
            <hr className="my-6 border-cream-dark" />
            <ul className="space-y-3 text-xs text-ink-muted">
              <li className="flex items-center gap-2">✦ Unlimited Events</li>
              <li className="flex items-center gap-2">✦ 50 GB Cloud Storage</li>
              <li className="flex items-center gap-2">✦ 1 Year Hosting Access</li>
              <li className="flex items-center gap-2">✦ Custom Design Theme colors</li>
              <li className="flex items-center gap-2">✦ Watermark Option</li>
              <li className="flex items-center gap-2">✦ Download QR Invitation Card</li>
              <li className="flex items-center gap-2">✦ Priority Email & Chat Support</li>
            </ul>
          </div>
          <button onClick={() => navigate('/register')} className="w-full bg-cream border border-gold hover:bg-gold hover:text-maroon-dark text-gold-dark font-bold text-xs py-3 rounded-radius-sm transition mt-8 shadow-sm">
            Get Luxury
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PAGE: ABOUT US
// ==========================================
const About = () => {
  return (
    <div className="py-20 px-6 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl md:text-4xl text-maroon-dark font-bold text-center">Our Story & Mission</h1>
      <div className="divider-ornament"><span>🪬</span></div>
      <div className="space-y-6 text-sm text-ink-muted leading-relaxed">
        <p>
          Shaadi QR was born from a simple observation: at every Indian wedding, hundreds of beautiful photos are clicked by friends and family, but they are rarely shared with the bride and groom. Finding them across multiple WhatsApp groups, drive links, or social channels is incredibly tedious.
        </p>
        <p>
          We created a platform that eliminates the complexity. By placing one elegant, wedding-themed QR code at your venue entrances, card invitations, or guest tables, family members of all ages can immediately upload high-resolution memories without logging in, downloading apps, or facing sign-up screens.
        </p>
        <p>
          Based in Delhi, India, we are committed to helping couples preserve their celebrations safely. Privacy is at the core of our platform—allowing hosts to password-protect albums, moderate submissions, and download everything as high-quality backups.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-12 text-center bg-white p-8 rounded-radius border border-cream-dark">
        <div>
          <div className="text-3xl font-serif font-bold text-maroon">1500+</div>
          <div className="text-[10px] text-gray-500 uppercase mt-1">Weddings Preserved</div>
        </div>
        <div>
          <div className="text-3xl font-serif font-bold text-maroon">250k+</div>
          <div className="text-[10px] text-gray-500 uppercase mt-1">Photos Uploaded</div>
        </div>
        <div>
          <div className="text-3xl font-serif font-bold text-maroon">99.9%</div>
          <div className="text-[10px] text-gray-500 uppercase mt-1">Private Uptime</div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PAGE: CONTACT US
// ==========================================
const Contact = ({ setToast }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setToast({ message: 'All fields are required.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await api.leads.submitLead(formData);
      setToast({ message: 'Your lead query was sent successfully!', type: 'success' });
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <span className="text-gold-dark font-semibold text-xs tracking-wider uppercase">Contact Details</span>
        <h1 className="font-serif text-3xl md:text-4xl text-maroon-dark font-bold leading-tight">Get in Touch with Shaadi QR</h1>
        <p className="text-ink-muted text-sm leading-relaxed">
          Planning a high-profile destination wedding or looking for white-labeled customized themes for multiple events? Send us your requirements and we will contact you.
        </p>

        <div className="space-y-4 pt-4">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-cream rounded-radius border border-cream-dark text-maroon"><Mail size={18} /></div>
            <div>
              <div className="text-xs font-bold text-maroon-dark">Email Support</div>
              <div className="text-xs text-ink-muted mt-0.5">support@shaadiqr.com</div>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-cream rounded-radius border border-cream-dark text-maroon"><Phone size={18} /></div>
            <div>
              <div className="text-xs font-bold text-maroon-dark">Business Hotline</div>
              <div className="text-xs text-ink-muted mt-0.5">+91 98765 43210</div>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-cream rounded-radius border border-cream-dark text-maroon"><MapPin size={18} /></div>
            <div>
              <div className="text-xs font-bold text-maroon-dark">HQ Location</div>
              <div className="text-xs text-ink-muted mt-0.5">Connaught Place, New Delhi, India</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-radius border border-cream-dark shadow-xl">
        <h2 className="font-serif text-xl text-maroon-dark font-bold mb-6">Send an Enquiry</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink mb-1.5">Full Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
              placeholder="e.g. Sanjay Singhania"
            />
          </div>
          <div>
            <label className="block font-semibold text-ink mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
              placeholder="e.g. sanjay@gmail.com"
            />
          </div>
          <div>
            <label className="block font-semibold text-ink mb-1.5">Message / Inquiry Details</label>
            <textarea 
              value={formData.message} 
              rows={4}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink resize-none"
              placeholder="Tell us about your event, wedding location, or custom plan requirements..."
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-light text-maroon-dark font-bold text-xs py-3.5 rounded-radius-sm transition shadow-md flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// PAGE: PRIVACY POLICY
// ==========================================
const Privacy = () => {
  return (
    <div className="py-20 px-6 max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl text-maroon-dark font-bold text-center">Privacy Policy</h1>
      <div className="divider-ornament"><span>🪬</span></div>
      <div className="space-y-4 text-xs text-ink-muted leading-relaxed">
        <p><b>Last Updated: June 1, 2026</b></p>
        <p>
          At Shaadi QR, accessible from shaadiqr.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Shaadi QR and how we use it.
        </p>
        <h3 className="font-bold text-maroon-dark text-sm mt-6">1. Information We Collect</h3>
        <p>
          We collect personal information such as name, email address, phone number, and IP address. Additionally, we store photos and videos uploaded by guests for events created by hosts.
        </p>
        <h3 className="font-bold text-maroon-dark text-sm mt-6">2. Media Storage Security</h3>
        <p>
          All uploaded guest photos and videos are stored in private secure cloud servers (Cloudinary or local systems depending on configurations). We implement strict access controls ensuring only authorized hosts can download these files.
        </p>
        <h3 className="font-bold text-maroon-dark text-sm mt-6">3. Content Moderation</h3>
        <p>
          Hosts retain complete control over content. Guest uploads are held in a pending queue until approved by the host before being displayed on public gallery views.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// PAGE: TERMS OF SERVICE
// ==========================================
const Terms = () => {
  return (
    <div className="py-20 px-6 max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl text-maroon-dark font-bold text-center">Terms of Service</h1>
      <div className="divider-ornament"><span>🪬</span></div>
      <div className="space-y-4 text-xs text-ink-muted leading-relaxed">
        <p><b>Last Updated: June 1, 2026</b></p>
        <p>
          Welcome to Shaadi QR. These Terms of Service govern your use of our wedding platform and associated storage, QR codes, and API services.
        </p>
        <h3 className="font-bold text-maroon-dark text-sm mt-6">1. Acceptable Use</h3>
        <p>
          By creating an event or uploading media, you represent that you own the rights to the files, or have guest permissions. Uploading offensive, copyrighted, or malicious media is strictly prohibited and accounts violating this will be terminated.
        </p>
        <h3 className="font-bold text-maroon-dark text-sm mt-6">2. Payment & Refunds</h3>
        <p>
          Payments for upgrades are processed via Razorpay. All fees are in INR. Due to cloud media storage costs, refunds are only issued if requested within 24 hours of payment and before any guest media uploads.
        </p>
        <h3 className="font-bold text-maroon-dark text-sm mt-6">3. Storage Limits & Expiry</h3>
        <p>
          Storage limits (2GB, 10GB, 50GB) and duration access (30 days, 90 days, 1 year) are strictly enforced based on purchased package tiers. Once an event expires, files will be permanently deleted after a 7-day grace period.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// PAGE: LOGIN
// ==========================================
const Login = ({ setUser, setToast }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setToast({ message: 'Enter username and password.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.login(formData.username, formData.password);
      setUser(data.user);
      setToast({ message: 'Logged in successfully!', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-cream">
      <div className="bg-white p-8 rounded-radius border border-cream-dark shadow-xl w-full max-w-sm">
        <h1 className="font-serif text-2xl text-maroon-dark font-bold text-center">Login to Shaadi QR</h1>
        <p className="text-center text-ink-muted text-xs mt-1">Welcome back! Manage your wedding albums.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-6">
          <div>
            <label className="block font-semibold text-ink mb-1">Username / Email</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
              placeholder="e.g. arjun"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-semibold text-ink">Password</label>
              <Link to="/forgot-password" className="text-maroon font-bold hover:underline text-[10px]">Forgot Password?</Link>
            </div>
            <input 
              type="password" 
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-light text-maroon-dark font-bold text-xs py-3.5 rounded-radius-sm transition shadow-md flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Login'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted mt-6">
          Don't have an account? <Link to="/register" className="text-maroon font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

// ==========================================
// PAGE: REGISTER & OTP VERIFICATION
// ==========================================
const Register = ({ setToast }) => {
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.phone || !formData.password) {
      setToast({ message: 'All fields are required.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.register(formData.username, formData.email, formData.phone, 'host', formData.password);
      if (res.otp_mock) {
        setToast({ message: `OTP Sent! (Mock Mode OTP: ${res.otp_mock})`, type: 'success' });
      } else {
        setToast({ message: 'Registration initial. OTP sent to your email!', type: 'success' });
      }
      setOtpSent(true);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) {
      setToast({ message: 'Enter verification OTP.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await api.auth.verifyOtp(formData.email, otp);
      setToast({ message: 'Email verified! Please login now.', type: 'success' });
      navigate('/login');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-cream">
      <div className="bg-white p-8 rounded-radius border border-cream-dark shadow-xl w-full max-w-sm">
        <h1 className="font-serif text-2xl text-maroon-dark font-bold text-center">
          {otpSent ? 'Verify OTP' : 'Create Album Account'}
        </h1>
        <p className="text-center text-ink-muted text-xs mt-1">
          {otpSent ? `Enter the 6-digit code sent to ${formData.email}` : 'Start hosting wedding memories.'}
        </p>

        {!otpSent ? (
          <form onSubmit={handleRegister} className="space-y-4 text-xs mt-6">
            <div>
              <label className="block font-semibold text-ink mb-1">Username</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
                placeholder="e.g. arjun"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
                placeholder="e.g. arjun@gmail.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Mobile Phone (India)</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
                placeholder="e.g. 9876543210"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Password</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-maroon-dark font-bold text-xs py-3.5 rounded-radius-sm transition shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 text-xs mt-6">
            <div>
              <label className="block font-semibold text-ink mb-1">6-Digit Verification Code</label>
              <input 
                type="text" 
                value={otp}
                maxLength={6}
                onChange={e => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-center text-ink tracking-widest font-bold"
                placeholder="123456"
              />
              <span className="text-[10px] text-gray-400 block text-center mt-2">
                * If using local test mode with MOCK_OTP, code will print inside the terminal logs.
              </span>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-maroon-dark font-bold text-xs py-3.5 rounded-radius-sm transition shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify & Register'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-ink-muted mt-6">
          Already verified? <Link to="/login" className="text-maroon font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

// ==========================================
// PAGE: FORGOT & RESET PASSWORD
// ==========================================
const ForgotPassword = ({ setToast }) => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setToast({ message: 'Enter your email address.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      if (res.otp_mock) {
        setToast({ message: `Reset OTP Sent! (Mock Mode OTP: ${res.otp_mock})`, type: 'success' });
      } else {
        setToast({ message: 'Reset OTP sent to your email!', type: 'success' });
      }
      setOtpSent(true);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setToast({ message: 'OTP and new password are required.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword(email, otp, newPassword);
      setToast({ message: 'Password reset successfully! Login now.', type: 'success' });
      navigate('/login');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-cream">
      <div className="bg-white p-8 rounded-radius border border-cream-dark shadow-xl w-full max-w-sm">
        <h1 className="font-serif text-2xl text-maroon-dark font-bold text-center">Reset Password</h1>
        <p className="text-center text-ink-muted text-xs mt-1">Get back access to your account.</p>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs mt-6">
            <div>
              <label className="block font-semibold text-ink mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
                placeholder="e.g. arjun@gmail.com"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-maroon-dark font-bold text-xs py-3.5 rounded-radius-sm transition shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 text-xs mt-6">
            <div>
              <label className="block font-semibold text-ink mb-1">6-Digit Reset OTP</label>
              <input 
                type="text" 
                value={otp}
                maxLength={6}
                onChange={e => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-center font-bold tracking-widest text-ink"
                placeholder="123456"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold transition text-sm text-ink"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-maroon-dark font-bold text-xs py-3.5 rounded-radius-sm transition shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ==========================================
// PAGE: CLIENT DASHBOARD (HOST LOGGED IN)
// ==========================================
const Dashboard = ({ setToast }) => {
  const [events, setEvents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Event Creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '', slug: '', bride_name: '', groom_name: '', date: '', location: '',
    is_password_protected: false, password: '', is_public: true, watermark_enabled: false,
    qr_theme: '{"color": "#7B1B2A", "bg": "#FBF6EE", "style": "classic"}',
    package: ''
  });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const evs = await api.events.list();
      setEvents(evs);
      const pks = await api.packages.list();
      setPackages(pks);
      
      // Auto fill first package in create form if empty
      if (pks.length > 0) {
        setEventForm(prev => ({ ...prev, package: pks[0].id }));
      }
    } catch (err) {
      setToast({ message: 'Error retrieving events: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSlugBlur = async () => {
    if (!eventForm.slug) return;
    try {
      const res = await api.events.checkSlug(eventForm.slug);
      if (!res.available) {
        setToast({ message: 'Slug already taken. Please choose another prefix.', type: 'error' });
      }
    } catch (e) {}
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.slug || !eventForm.bride_name || !eventForm.groom_name || !eventForm.date || !eventForm.location) {
      setToast({ message: 'Please complete all required fields.', type: 'error' });
      return;
    }
    setCreating(true);
    try {
      const newEv = await api.events.create(eventForm);
      setToast({ message: 'Wedding event album created successfully!', type: 'success' });
      setShowCreateModal(false);
      
      // Reset form
      setEventForm({
        name: '', slug: '', bride_name: '', groom_name: '', date: '', location: '',
        is_password_protected: false, password: '', is_public: true, watermark_enabled: false,
        qr_theme: '{"color": "#7B1B2A", "bg": "#FBF6EE", "style": "classic"}',
        package: packages[0]?.id || ''
      });
      
      // Direct user to purchase upgrade if they want premium options immediately
      navigate(`/dashboard/events/${newEv.id}`);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${name}' and all guest memories?`)) return;
    try {
      await api.events.delete(id);
      setToast({ message: 'Event deleted.', type: 'success' });
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-maroon" size={36} />
        <span className="text-xs text-ink-muted">Loading your wedding dashboard...</span>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 md:px-12 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-cream-dark pb-6">
        <div>
          <h1 className="font-serif text-3xl text-maroon-dark font-bold">Wedding Albums</h1>
          <p className="text-ink-muted text-xs mt-1">Manage and access your wedding events, custom QRs, and visual logs.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-maroon hover:bg-maroon-light text-white text-xs font-bold px-4 py-3 rounded-radius shadow-md flex items-center gap-1.5 transition"
        >
          <Plus size={14} />
          <span>New Wedding Album</span>
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-radius border border-cream-dark space-y-4">
          <div className="text-5xl">🎉</div>
          <h3 className="font-serif text-xl font-bold text-maroon-dark">No Events Found</h3>
          <p className="text-ink-muted text-xs max-w-sm mx-auto">Create your first wedding event to generate invitation QR codes and start collecting guest memories.</p>
          <button onClick={() => setShowCreateModal(true)} className="bg-gold text-maroon-dark font-bold text-xs px-6 py-3 rounded-radius transition shadow-md">
            Create Wedding Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-radius border border-cream-dark p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-maroon-dark">{event.name}</h3>
                    <div className="text-[10px] text-gray-400 mt-0.5">slug: shaadiqr.com/e/{event.slug}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    event.is_expired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {event.is_expired ? 'Expired' : 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-ink-muted py-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield size={14} />
                    <span>{event.is_password_protected ? 'Password Locked' : 'Public Access'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles size={14} />
                    <span>Plan: {event.package_name || 'Basic'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-cream-dark pt-4 mt-6">
                <div className="flex gap-2">
                  <Link to={`/dashboard/events/${event.id}`} className="bg-gold/15 hover:bg-gold/30 text-gold-dark font-bold text-[10px] px-4 py-2 rounded-radius-sm transition">
                    Manage Album & QR
                  </Link>
                  <a href={`/e/${event.slug}`} target="_blank" className="bg-cream hover:bg-cream-dark text-ink font-semibold text-[10px] px-4 py-2 rounded-radius-sm transition">
                    Visit Upload Page
                  </a>
                </div>
                <button onClick={() => handleDeleteEvent(event.id, event.name)} className="text-gray-400 hover:text-red-700 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-radius-lg border border-cream-dark p-8 w-full max-w-lg shadow-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl text-maroon-dark font-bold">New Wedding Album</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-ink"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink mb-1.5">Bride's Name *</label>
                  <input 
                    type="text" 
                    value={eventForm.bride_name}
                    onChange={e => setEventForm({ ...eventForm, bride_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-cream-dark rounded-radius-sm outline-none focus:border-gold text-sm text-ink"
                    placeholder="e.g. Priya"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1.5">Groom's Name *</label>
                  <input 
                    type="text" 
                    value={eventForm.groom_name}
                    onChange={e => setEventForm({ ...eventForm, groom_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-cream-dark rounded-radius-sm outline-none focus:border-gold text-sm text-ink"
                    placeholder="e.g. Arjun"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">Event Name *</label>
                <input 
                  type="text" 
                  value={eventForm.name}
                  onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-cream-dark rounded-radius-sm outline-none focus:border-gold text-sm text-ink"
                  placeholder="e.g. Priya & Arjun Wedding Ceremony"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">Custom URL Slug *</label>
                <div className="flex">
                  <span className="bg-cream border border-r-0 border-cream-dark px-3 py-2.5 rounded-l-radius-sm text-ink-muted select-none">
                    shaadiqr.com/e/
                  </span>
                  <input 
                    type="text" 
                    value={eventForm.slug}
                    onBlur={handleSlugBlur}
                    onChange={e => setEventForm({ ...eventForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-4 py-2.5 border border-cream-dark rounded-r-radius-sm outline-none focus:border-gold text-sm text-ink"
                    placeholder="priya-arjun-wedding"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Alphanumeric characters and hyphens only.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink mb-1.5">Event Date *</label>
                  <input 
                    type="date" 
                    value={eventForm.date}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-cream-dark rounded-radius-sm outline-none focus:border-gold text-sm text-ink"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1.5">Location Venue *</label>
                  <input 
                    type="text" 
                    value={eventForm.location}
                    onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 border border-cream-dark rounded-radius-sm outline-none focus:border-gold text-sm text-ink"
                    placeholder="e.g. Palace Hotel, Delhi"
                  />
                </div>
              </div>

              <div className="border-t border-cream-dark pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-ink">Password Protection</div>
                    <div className="text-[10px] text-gray-400">Lock the gallery from unauthorized guests.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={eventForm.is_password_protected}
                    onChange={e => setEventForm({ ...eventForm, is_password_protected: e.target.checked })}
                    className="w-4 h-4 accent-maroon"
                  />
                </div>
                {eventForm.is_password_protected && (
                  <input 
                    type="text" 
                    value={eventForm.password}
                    onChange={e => setEventForm({ ...eventForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-cream-dark rounded-radius-sm outline-none focus:border-gold text-sm text-ink"
                    placeholder="Set passcode (e.g. PriyaArjun2026)"
                  />
                )}
              </div>

              <button 
                type="submit" 
                disabled={creating}
                className="w-full bg-maroon hover:bg-maroon-light text-white font-bold text-xs py-3.5 rounded-radius shadow-md transition flex items-center justify-center gap-2 mt-4"
              >
                {creating ? <Loader2 className="animate-spin" size={16} /> : 'Create Wedding Album'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// PAGE: EVENT DETAIL (ALBUM, QR DESIGNER, PAYMENTS)
// ==========================================
const HostEventDetail = ({ setToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [media, setMedia] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [packages, setPackages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('album');
  
  // Custom QR Designer State
  const [qrTheme, setQrTheme] = useState({ fg: '#7B1B2A', bg: '#FBF6EE', label: '' });
  const [qrPreviewUrl, setQrPreviewUrl] = useState('');
  
  // Album filtering states
  const [mediaFilter, setMediaFilter] = useState('all'); // all, photo, video
  const [approvalFilter, setApprovalFilter] = useState('all'); // all, approved, pending
  
  // Payments billing state
  const [billingForm, setBillingForm] = useState({ name: '', email: '', phone: '' });
  const [paying, setPaying] = useState(false);

  const fetchEventData = async () => {
    try {
      const evs = await api.events.list();
      const currentEv = evs.find(e => e.id === intId);
      if (!currentEv) throw new Error('Album not found.');
      setEvent(currentEv);
      
      const pks = await api.packages.list();
      setPackages(pks);

      // Load billing details fallback
      const u = api.auth.getCurrentUser();
      if (u) {
        setBillingForm({ name: u.username, email: u.email, phone: '' });
      }

      // Default label to bride/groom names
      setQrTheme(prev => ({ ...prev, label: `${currentEv.bride_name} & ${currentEv.groom_name}` }));

      // Fetch Album entries
      const album = await api.host.getAlbum(intId);
      setMedia(album.uploads);
      setWishes(album.wishes);

      // Fetch Analytics
      const stats = await api.host.getAnalytics(intId);
      setAnalytics(stats);

      setLoading(false);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      navigate('/dashboard');
    }
  };

  const intId = parseInt(id, 10);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  useEffect(() => {
    if (event) {
      setQrPreviewUrl(api.events.getCustomQrUrl(event.id, qrTheme.fg, qrTheme.bg, qrTheme.label));
    }
  }, [qrTheme, event]);

  const handleApproveReject = async (type, itemId, statusAction) => {
    try {
      await api.host.approveRejectMedia(type, itemId, statusAction);
      setToast({ message: `Successfully ${statusAction}d.`, type: 'success' });
      
      // Update arrays
      if (type === 'media') {
        setMedia(media.map(m => m.id === itemId ? { ...m, is_approved: statusAction === 'approve' } : m));
      } else {
        setWishes(wishes.map(w => w.id === itemId ? { ...w, is_approved: statusAction === 'approve' } : w));
      }
      
      // Re-fetch analytics to reflect guest changes
      const stats = await api.host.getAnalytics(event.id);
      setAnalytics(stats);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDeleteMedia = async (type, itemId) => {
    if (!window.confirm('Are you sure you want to delete this guest upload? This action is permanent.')) return;
    try {
      await api.host.deleteMedia(type, itemId);
      setToast({ message: 'Deleted.', type: 'success' });
      if (type === 'media') {
        setMedia(media.filter(m => m.id !== itemId));
      } else {
        setWishes(wishes.filter(w => w.id !== itemId));
      }
      const stats = await api.host.getAnalytics(event.id);
      setAnalytics(stats);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  // payment verification callback
  const handleUpgradePlan = async (packageId) => {
    if (!billingForm.phone) {
      setToast({ message: 'Billing mobile number is required for payments verification.', type: 'error' });
      return;
    }
    setPaying(true);
    try {
      const order = await api.payments.createOrder(packageId, event.id);
      
      // Verification payload
      const verifyPayload = {
        razorpay_order_id: order.order_id,
        razorpay_payment_id: `pay_mock_${Math.floor(Math.random() * 900000) + 100000}`,
        razorpay_signature: `sig_mock_${Math.floor(Math.random() * 900000) + 100000}`,
        package_id: packageId,
        event_id: event.id,
        billing_name: billingForm.name,
        billing_email: billingForm.email,
        billing_phone: billingForm.phone
      };

      const verification = await api.payments.verifyPayment(verifyPayload);
      setToast({ message: 'Payment Mock completed successfully! Package upgraded.', type: 'success' });
      
      // Reload page details
      fetchEventData();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-maroon" size={36} />
        <span className="text-xs text-ink-muted">Loading event details...</span>
      </div>
    );
  }

  // Filtered lists
  const filteredMedia = media.filter(m => {
    if (mediaFilter !== 'all' && m.file_type !== mediaFilter) return false;
    if (approvalFilter === 'approved' && !m.is_approved) return false;
    if (approvalFilter === 'pending' && m.is_approved) return false;
    return true;
  });

  const filteredWishes = wishes.filter(w => {
    if (approvalFilter === 'approved' && !w.is_approved) return false;
    if (approvalFilter === 'pending' && w.is_approved) return false;
    return true;
  });

  return (
    <div className="py-12 px-6 md:px-12 max-w-6xl mx-auto space-y-8">
      {/* Event Header Card */}
      <div className="bg-white rounded-radius border border-cream-dark p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] text-gold-dark font-bold uppercase tracking-widest">{event.package_name} Plan Album</span>
          <h1 className="font-serif text-2xl md:text-3xl text-maroon-dark font-bold mt-1">{event.name}</h1>
          <div className="flex gap-4 text-xs text-ink-muted mt-2">
            <span>Date: <b>{event.date}</b></span>
            <span>Slug: <b>{event.slug}</b></span>
            <span>Expiry Date: <b>{event.expiry_date}</b></span>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <a 
            href={`/gallery/${event.slug}`} 
            target="_blank" 
            className="flex-1 md:flex-initial text-center bg-maroon text-white hover:bg-maroon-light font-bold text-xs px-5 py-3 rounded-radius transition shadow-sm"
          >
            Open Public Gallery
          </a>
          <a 
            href={api.host.getDownloadZipUrl(event.id)}
            download
            className="flex-1 md:flex-initial text-center bg-cream border border-gold hover:bg-gold hover:text-maroon-dark text-gold-dark font-bold text-xs px-5 py-3 rounded-radius transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            <span>Download ZIP</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-dark overflow-x-auto text-xs font-semibold">
        <button 
          onClick={() => setActiveTab('album')}
          className={`px-6 py-3.5 border-b-2 transition ${
            activeTab === 'album' ? 'border-maroon text-maroon-dark' : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Photos & Videos ({media.length})
        </button>
        <button 
          onClick={() => setActiveTab('wishes')}
          className={`px-6 py-3.5 border-b-2 transition ${
            activeTab === 'wishes' ? 'border-maroon text-maroon-dark' : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Guest Wishes ({wishes.length})
        </button>
        <button 
          onClick={() => setActiveTab('qr')}
          className={`px-6 py-3.5 border-b-2 transition ${
            activeTab === 'qr' ? 'border-maroon text-maroon-dark' : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          QR Invitation Designer
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`px-6 py-3.5 border-b-2 transition ${
            activeTab === 'billing' ? 'border-maroon text-maroon-dark' : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Upgrade Plan & Invoices
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'album' && (
        <div className="space-y-6">
          {/* Filters controls */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-cream/50 p-4 rounded-radius border border-cream-dark">
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-semibold">Format:</span>
                <select value={mediaFilter} onChange={e => setMediaFilter(e.target.value)} className="bg-white border border-cream-dark px-3 py-1.5 rounded-radius-sm outline-none text-ink text-xs">
                  <option value="all">All Media</option>
                  <option value="photo">Photos Only</option>
                  <option value="video">Videos Only</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-semibold">Status:</span>
                <select value={approvalFilter} onChange={e => setApprovalFilter(e.target.value)} className="bg-white border border-cream-dark px-3 py-1.5 rounded-radius-sm outline-none text-ink text-xs">
                  <option value="all">All Submissions</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
            </div>
            
            {analytics && (
              <div className="text-xs text-ink-muted flex items-center gap-4">
                <span>Storage used: <b>{analytics.storage_used_gb} GB</b> of {analytics.storage_limit_gb} GB</span>
                <div className="w-24 bg-cream-dark h-2 rounded-full overflow-hidden">
                  <div className="bg-gold h-full" style={{ width: `${analytics.storage_percentage}%` }} />
                </div>
              </div>
            )}
          </div>

          {filteredMedia.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-radius border border-cream-dark text-xs text-ink-muted">
              No photo/video uploads found matching selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {filteredMedia.map(item => (
                <div key={item.id} className="bg-white rounded-radius overflow-hidden border border-cream-dark shadow-sm group relative flex flex-col justify-between">
                  <div className="aspect-square bg-cream-dark relative overflow-hidden">
                    {item.file_type === 'photo' ? (
                      <img src={item.file} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" alt="Guest upload" />
                    ) : (
                      <video src={item.file} className="w-full h-full object-cover" controls={false} />
                    )}
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                      {item.file_type}
                    </span>
                    {!item.is_approved && (
                      <div className="absolute inset-0 bg-maroon-dark/20 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-maroon text-white font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                          Pending Review
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-1 bg-white">
                    <div className="font-bold text-ink text-xs truncate">By {item.guest_name}</div>
                    <div className="text-[10px] text-gray-400">Date: {new Date(item.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="flex border-t border-cream-dark text-xs">
                    {item.is_approved ? (
                      <button 
                        onClick={() => handleApproveReject('media', item.id, 'reject')}
                        className="flex-1 py-2 text-center text-maroon hover:bg-maroon-light/10 font-bold border-r border-cream-dark transition"
                      >
                        Reject
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApproveReject('media', item.id, 'approve')}
                        className="flex-1 py-2 text-center text-green-700 hover:bg-green-100 font-bold border-r border-cream-dark transition"
                      >
                        Approve
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteMedia('media', item.id)}
                      className="px-4 text-center text-gray-400 hover:text-red-700 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'wishes' && (
        <div className="space-y-4">
          <div className="flex gap-4 text-xs bg-cream/50 p-4 rounded-radius border border-cream-dark">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-semibold">Moderation status:</span>
              <select value={approvalFilter} onChange={e => setApprovalFilter(e.target.value)} className="bg-white border border-cream-dark px-3 py-1.5 rounded-radius-sm outline-none text-ink text-xs">
                <option value="all">All Wishes</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>

          {filteredWishes.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-radius border border-cream-dark text-xs text-ink-muted">
              No guest wishes found matching selected filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWishes.map(wish => (
                <div key={wish.id} className="bg-white p-6 rounded-radius border border-cream-dark shadow-sm flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-maroon-dark text-xs">{wish.guest_name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        wish.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {wish.is_approved ? 'Approved' : 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted italic leading-relaxed">"{wish.message}"</p>
                    <div className="text-[10px] text-gray-400">{new Date(wish.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="flex gap-2">
                    {wish.is_approved ? (
                      <button 
                        onClick={() => handleApproveReject('wish', wish.id, 'reject')}
                        className="bg-maroon/10 hover:bg-maroon-light/20 text-maroon-dark text-[10px] font-bold px-3 py-1.5 rounded-radius-sm transition"
                      >
                        Reject
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApproveReject('wish', wish.id, 'approve')}
                        className="bg-green-100 hover:bg-green-200 text-green-800 text-[10px] font-bold px-3 py-1.5 rounded-radius-sm transition"
                      >
                        Approve
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteMedia('wish', wish.id)}
                      className="p-1.5 text-gray-400 hover:text-red-700 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-radius border border-cream-dark shadow-sm">
          {/* Custom controls */}
          <div className="space-y-6 text-xs">
            <h2 className="font-serif text-lg font-bold text-maroon-dark">QR Custom Designer</h2>
            <p className="text-ink-muted leading-relaxed">Modify QR foreground border colors and overlays to fit your wedding themes.</p>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-ink mb-1.5">Foreground Color (Hex)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={qrTheme.fg}
                    onChange={e => setQrTheme({ ...qrTheme, fg: e.target.value })}
                    className="w-10 h-10 border border-cream-dark rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={qrTheme.fg}
                    onChange={e => setQrTheme({ ...qrTheme, fg: e.target.value })}
                    className="w-full px-4 py-2 border border-cream-dark rounded-radius-sm text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">Background Color (Hex)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={qrTheme.bg}
                    onChange={e => setQrTheme({ ...qrTheme, bg: e.target.value })}
                    className="w-10 h-10 border border-cream-dark rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={qrTheme.bg}
                    onChange={e => setQrTheme({ ...qrTheme, bg: e.target.value })}
                    className="w-full px-4 py-2 border border-cream-dark rounded-radius-sm text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">Bottom Banner Text Overlay</label>
                <input 
                  type="text" 
                  value={qrTheme.label}
                  onChange={e => setQrTheme({ ...qrTheme, label: e.target.value })}
                  className="w-full px-4 py-2.5 border border-cream-dark rounded-radius-sm text-sm outline-none focus:border-gold"
                  placeholder="e.g. Priya & Arjun's Wedding"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-cream-dark space-y-4">
              <h4 className="font-bold text-maroon-dark">Share Invitation Code</h4>
              <div className="flex gap-2">
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Upload wedding photos & wishes here at Priya & Arjun's wedding album: http://localhost:5173/e/${event.slug}`)}`}
                  target="_blank"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 rounded-radius-sm flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Share2 size={14} />
                  <span>Share on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Code display */}
          <div className="flex flex-col items-center justify-center p-6 bg-cream rounded-radius border border-cream-dark text-center">
            <div className="bg-white p-4 rounded-radius shadow-xl border-2 border-gold/30">
              {qrPreviewUrl ? (
                <img src={qrPreviewUrl} className="w-56 h-64 object-contain" alt="Wedding QR Code" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center bg-gray-100 text-gray-400">Loading QR Preview...</div>
              )}
            </div>
            <div className="text-[10px] text-ink-muted mt-4">Slug target: shaadiqr.com/e/{event.slug}</div>
            
            <div className="flex gap-2 mt-6 w-full">
              <a 
                href={qrPreviewUrl} 
                download={`${event.slug}_qr.png`}
                target="_blank"
                className="flex-1 bg-maroon hover:bg-maroon-dark text-white font-bold text-xs py-3 rounded-radius-sm transition shadow-md"
              >
                Download QR Code
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs bg-white p-8 rounded-radius border border-cream-dark shadow-sm">
          {/* Plans selection for upgrades */}
          <div className="space-y-6">
            <h2 className="font-serif text-lg font-bold text-maroon-dark">Select Plan Upgrade</h2>
            <p className="text-ink-muted leading-relaxed">Upgrade your wedding album packages to unlock more storage and zip downloads.</p>

            <form onSubmit={e => e.preventDefault()} className="space-y-4 p-4 border border-cream-dark rounded-radius bg-cream/40">
              <h4 className="font-bold text-maroon-dark">1. Fill Billing Profile</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Billing Name</label>
                  <input 
                    type="text" 
                    value={billingForm.name} 
                    onChange={e => setBillingForm({ ...billingForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-cream-dark rounded-radius-sm text-xs bg-white text-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Billing Email</label>
                  <input 
                    type="email" 
                    value={billingForm.email} 
                    onChange={e => setBillingForm({ ...billingForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-cream-dark rounded-radius-sm text-xs bg-white text-ink outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Mobile Phone (Required for verification) *</label>
                <input 
                  type="text" 
                  value={billingForm.phone} 
                  onChange={e => setBillingForm({ ...billingForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-cream-dark rounded-radius-sm text-xs bg-white text-ink outline-none"
                  placeholder="e.g. 9876543210"
                />
              </div>
            </form>

            <div className="space-y-3">
              <h4 className="font-bold text-maroon-dark">2. Choose Upgrade Tier</h4>
              {packages.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 border border-cream-dark rounded-radius hover:border-gold transition">
                  <div>
                    <div className="font-bold text-maroon-dark text-sm">{p.name} Plan</div>
                    <div className="text-[10px] text-gray-400">Limit: {p.storage_limit_gb} GB, Duration: {p.duration_days} days</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink">₹{p.price_in_inr}</span>
                    <button 
                      onClick={() => handleUpgradePlan(p.id)}
                      disabled={paying}
                      className="bg-gold hover:bg-gold-light text-maroon-dark font-bold text-[10px] px-4 py-2 rounded shadow transition"
                    >
                      Buy Upgrade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local invoices ledger */}
          <div className="space-y-4 border-l border-cream-dark pl-0 md:pl-8">
            <h2 className="font-serif text-lg font-bold text-maroon-dark">Payment Invoices</h2>
            <p className="text-ink-muted">View past package purchases ledger and download receipts in PDF.</p>

            <div className="space-y-3 mt-4">
              {event.payments && event.payments.length > 0 ? (
                event.payments.map(payment => (
                  <div key={payment.id} className="bg-cream/40 p-4 border border-cream-dark rounded-radius flex justify-between items-center">
                    <div>
                      <div className="font-bold text-maroon-dark">{payment.invoice_number}</div>
                      <div className="text-[10px] text-gray-400">Status: {payment.status} | Plan: {payment.package_name}</div>
                    </div>
                    <a 
                      href={api.host.getInvoiceUrl(payment.id)} 
                      download
                      className="bg-white border border-cream-dark hover:bg-gold-light hover:text-maroon-dark p-2 rounded text-ink transition shadow-sm"
                    >
                      <FileText size={16} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-gray-400 bg-cream/10 rounded-radius border border-dashed border-cream-dark">
                  No purchase invoice receipts found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// PAGE: GUEST UPLOAD PORTAL (NO LOGIN REQ)
// ==========================================
const GuestUpload = ({ setToast }) => {
  const { slug } = useParams();
  
  const [event, setEvent] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Forms guest states
  const [guestForm, setGuestForm] = useState({ name: '', mobile: '', wish: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [captcha, setCaptcha] = useState({ question: '', answer: '' });
  const [captchaInput, setCaptchaInput] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [successUpload, setSuccessUpload] = useState(false);

  const fetchPublicDetails = async (passVal = '') => {
    try {
      const res = await api.guest.getPublicEvent(slug, passVal);
      setEvent(res);
      if (res.is_password_protected) {
        setPasswordSubmitted(true);
      }
      setCaptcha(generateMathCaptcha());
      setLoading(false);
    } catch (err) {
      if (err.status === 401) {
        setPasswordError('Password required or incorrect passcode. Please verify and try again.');
        setPasswordSubmitted(false);
        setLoading(false);
      } else {
        setToast({ message: err.message, type: 'error' });
      }
    }
  };

  useEffect(() => {
    fetchPublicDetails();
  }, [slug]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    fetchPublicDetails(password);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isPhoto = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (isPhoto && file.size > 10 * 1024 * 1024) {
      setToast({ message: 'Photo size cannot exceed 10 MB.', type: 'error' });
      return;
    }
    if (isVideo && file.size > 100 * 1024 * 1024) {
      setToast({ message: 'Video size cannot exceed 100 MB.', type: 'error' });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !guestForm.wish) {
      setToast({ message: 'Please write a blessing wish or attach media to upload.', type: 'error' });
      return;
    }
    if (!captchaInput || parseInt(captchaInput, 10) !== captcha.answer) {
      setToast({ message: 'Incorrect math CAPTCHA spam protection. Please try again.', type: 'error' });
      setCaptcha(generateMathCaptcha());
      setCaptchaInput('');
      return;
    }
    
    setUploading(true);
    try {
      // 1. Submit media upload if attached
      if (selectedFile) {
        const fd = new FormData();
        fd.append('event', event.id);
        fd.append('file', selectedFile);
        fd.append('guest_name', guestForm.name);
        fd.append('guest_mobile', guestForm.mobile);
        fd.append('captcha_q', captcha.question);
        fd.append('captcha_a', captchaInput);
        
        await api.guest.uploadMedia(fd);
      }

      // 2. Submit Wish details if written
      if (guestForm.wish) {
        await api.guest.submitWish({
          event: event.id,
          guest_name: guestForm.name || 'Anonymous Guest',
          message: guestForm.wish,
          captcha_q: captcha.question,
          captcha_a: captchaInput
        });
      }

      setSuccessUpload(true);
      setToast({ message: 'Uploaded successfully! Pending host moderation.', type: 'success' });
      
      // Reset details
      setGuestForm({ name: '', mobile: '', wish: '' });
      setSelectedFile(null);
      setCaptchaInput('');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setCaptcha(generateMathCaptcha());
      setCaptchaInput('');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-maroon" size={36} />
        <span className="text-xs text-ink-muted font-serif">Welcome guest... loading wedding portal</span>
      </div>
    );
  }

  // Password Lock view
  if (event && event.is_password_protected && !passwordSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-maroon-dark bg-opacity-95">
        <div className="bg-white p-8 rounded-radius border border-cream-dark shadow-2xl w-full max-w-sm">
          <div className="text-center space-y-2">
            <div className="text-4xl text-gold-dark animate-pulse">🔒</div>
            <h2 className="font-serif text-xl font-bold text-maroon-dark">Password Protected Album</h2>
            <p className="text-xs text-ink-muted">Please enter the private wedding password to upload memories or view blessings.</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs mt-6">
            <div>
              <label className="block font-semibold mb-1">Passcode</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold text-sm text-ink text-center tracking-widest"
                placeholder="••••••••"
              />
              {passwordError && <span className="text-[10px] text-red-700 block mt-2 text-center">{passwordError}</span>}
            </div>
            <button type="submit" className="w-full bg-gold text-maroon-dark font-bold text-xs py-3 rounded-radius-sm transition shadow-md">
              Verify Passcode
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (successUpload) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 luxury-gradient text-white text-center">
        <div className="bg-white/10 border border-white/20 p-8 rounded-radius-lg max-w-sm space-y-6 backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-gold text-maroon-dark flex items-center justify-center text-3xl mx-auto">✦</div>
          <h2 className="font-serif text-2xl font-bold text-gold-light">Thank You!</h2>
          <p className="text-xs text-cream/80 leading-relaxed">
            Your photos, videos, and wishes have been submitted successfully. Once the host approves them, they will be visible in the digital gallery.
          </p>
          <button 
            onClick={() => { setSuccessUpload(false); setCaptcha(generateMathCaptcha()); }} 
            className="bg-gold text-maroon-dark hover:bg-gold-light px-6 py-2.5 rounded-radius text-xs font-bold transition shadow-md w-full"
          >
            Upload More Memories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen luxury-gradient text-white py-12 px-6">
      <div className="max-w-md mx-auto space-y-8">
        {/* Wedding details card banner */}
        <div className="text-center space-y-2 border-b border-white/20 pb-6">
          <span className="text-xs text-gold-light uppercase tracking-widest font-bold font-serif">Shaadi QR Portal</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">{event.name}</h1>
          <div className="text-xs text-cream/70 flex justify-center gap-4">
            <span>Date: <b>{event.date}</b></span>
            <span>Venue: <b>{event.location}</b></span>
          </div>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white/10 border border-white/20 rounded-radius-lg p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
          <h3 className="font-serif text-lg font-bold text-gold-light text-center">Send Wishes & Media</h3>
          
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-cream/90 mb-1.5">Guest Name (Optional)</label>
              <input 
                type="text" 
                value={guestForm.name}
                onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-white/20 bg-white/10 text-white rounded-radius-sm outline-none focus:border-gold text-sm"
                placeholder="e.g. Ramesh Chawla"
              />
            </div>

            <div>
              <label className="block font-semibold text-cream/90 mb-1.5">Mobile Number (Spam Limit check) *</label>
              <input 
                type="text" 
                value={guestForm.mobile}
                onChange={e => setGuestForm({ ...guestForm, mobile: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full px-4 py-2.5 border border-white/20 bg-white/10 text-white rounded-radius-sm outline-none focus:border-gold text-sm"
                placeholder="e.g. 9876543210"
              />
              <span className="text-[9px] text-white/50 mt-1 block">Used only to restrict spam uploads to 10 files/hour.</span>
            </div>

            {/* Upload Selector Box */}
            <div>
              <label className="block font-semibold text-cream/90 mb-1.5">Select Photo / Video File</label>
              <div className="border-2 border-dashed border-gold/40 hover:border-gold rounded-radius p-6 text-center bg-white/5 cursor-pointer relative transition">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, video/mp4, video/quicktime"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-2xl mb-2">📸</div>
                <div className="text-white font-medium text-xs">
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Tap here to pick from camera / gallery'}
                </div>
                <div className="text-[10px] text-white/40 mt-1">Photos (JPG/PNG) &lt; 10MB | Videos (MP4/MOV) &lt; 100MB</div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-cream/90 mb-1.5">Write Blessing Message / Wish</label>
              <textarea 
                value={guestForm.wish}
                onChange={e => setGuestForm({ ...guestForm, wish: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-white/20 bg-white/10 text-white rounded-radius-sm outline-none focus:border-gold text-sm resize-none"
                placeholder="Write your wishes for the newlywed couple..."
              />
            </div>

            {/* Captcha validation widget */}
            <div className="border-t border-white/20 pt-4 space-y-3">
              <label className="block font-semibold text-gold-light text-center">Spam Protection Captcha</label>
              <div className="flex gap-4 items-center">
                <div className="flex-1 bg-white/20 border border-white/25 py-2.5 text-center text-sm font-bold text-white rounded select-none tracking-wider">
                  Solve Math: {captcha.question} = ?
                </div>
                <input 
                  type="text" 
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  className="w-24 px-4 py-2.5 border border-white/20 bg-white/10 text-white text-center font-bold rounded text-sm outline-none focus:border-gold"
                  placeholder="Answer"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={uploading}
              className="w-full bg-gold hover:bg-gold-light text-maroon-dark font-bold text-sm py-3.5 rounded-radius transition shadow-md flex items-center justify-center gap-2 mt-6"
            >
              {uploading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Memories'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PAGE: PUBLIC WEDDING GALLERY
// ==========================================
const PublicGallery = ({ setToast }) => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState(null);

  const fetchGalleryDetails = async (passVal = '') => {
    try {
      const res = await api.guest.getPublicEvent(slug, passVal);
      setEvent(res);
      if (res.is_password_protected) {
        setPasswordSubmitted(true);
      }
      setLoading(false);
    } catch (err) {
      if (err.status === 401) {
        setPasswordError('Password required or incorrect passcode.');
        setPasswordSubmitted(false);
        setLoading(false);
      } else {
        setToast({ message: err.message, type: 'error' });
      }
    }
  };

  useEffect(() => {
    fetchGalleryDetails();
  }, [slug]);

  const handlePasswordVerify = (e) => {
    e.preventDefault();
    setPasswordError('');
    fetchGalleryDetails(password);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-maroon" size={36} />
        <span className="text-xs text-ink-muted font-serif">Opening public wedding gallery...</span>
      </div>
    );
  }

  if (event && event.is_password_protected && !passwordSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-cream">
        <div className="bg-white p-8 rounded-radius border border-cream-dark shadow-2xl w-full max-w-sm">
          <div className="text-center space-y-2">
            <Lock size={32} className="text-maroon mx-auto" />
            <h2 className="font-serif text-xl font-bold text-maroon-dark">Password-Protected Gallery</h2>
            <p className="text-xs text-ink-muted">This digital album is private. Enter the family password to access the public display.</p>
          </div>

          <form onSubmit={handlePasswordVerify} className="space-y-4 text-xs mt-6">
            <div>
              <label className="block font-semibold mb-1">Album Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-cream-dark rounded-radius-sm outline-none focus:border-gold text-sm text-ink text-center tracking-widest"
                placeholder="••••••••"
              />
              {passwordError && <span className="text-[10px] text-red-700 block mt-2 text-center">{passwordError}</span>}
            </div>
            <button type="submit" className="w-full bg-gold text-maroon-dark font-bold text-xs py-3 rounded-radius-sm transition shadow-md">
              Unlock Album
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { uploads = [], wishes = [] } = event;

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Title display */}
        <div className="text-center space-y-3">
          <span className="text-2xl animate-bounce">🪬</span>
          <h1 className="font-serif text-3xl md:text-5xl text-maroon-dark font-bold leading-tight">
            {event.bride_name} & {event.groom_name}
          </h1>
          <p className="font-serif italic text-gold-dark text-sm">Wedding Celebration Gallery</p>
          <div className="flex justify-center gap-4 text-xs text-ink-muted">
            <span>Date: <b>{event.date}</b></span>
            <span>Venue: <b>{event.location}</b></span>
          </div>
          <div className="divider-ornament"><span>✦</span></div>
        </div>

        {/* Wishes Marquee Wall */}
        {wishes.length > 0 && (
          <div className="bg-white p-6 rounded-radius border border-cream-dark shadow-sm">
            <h4 className="font-serif text-sm font-bold text-maroon-dark mb-4 border-b border-cream-dark pb-2">Guest Blessings Wall</h4>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin text-xs text-ink-muted">
              {wishes.map(w => (
                <div key={w.id} className="bg-cream/40 p-4 rounded border border-cream-dark min-w-[240px] max-w-[280px] flex-shrink-0 relative">
                  <span className="absolute top-1 right-2 text-gold-light/40 text-2xl font-serif">"</span>
                  <div className="font-bold text-maroon-dark">{w.guest_name}</div>
                  <p className="mt-1 leading-relaxed truncate">{w.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-maroon-dark border-b border-cream-dark pb-2">Wedding Memories</h3>
          {uploads.length === 0 ? (
            <div className="bg-white p-12 text-center text-xs text-ink-muted rounded-radius border border-cream-dark">
              No approved guest memories found yet. Photos and videos will appear here once approved by the hosts.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {uploads.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setLightboxItem(item)}
                  className="bg-white rounded-radius overflow-hidden border border-cream-dark shadow-sm cursor-pointer group relative aspect-square"
                >
                  {item.file_type === 'photo' ? (
                    <img src={item.file} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" alt="Wedding guest" />
                  ) : (
                    <div className="w-full h-full bg-black/10 flex items-center justify-center relative">
                      <video src={item.file} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white text-3xl font-bold">▶</div>
                    </div>
                  )}
                  
                  {/* Photo details on hover overlay */}
                  <div className="absolute inset-0 bg-maroon-dark/60 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-all duration-200">
                    <div className="text-white font-bold text-xs">By {item.guest_name}</div>
                    <div className="text-[10px] text-gold-light mt-0.5">{item.file_type.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX OVERLAY */}
      {lightboxItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <button 
            onClick={() => setLightboxItem(null)} 
            className="absolute top-6 right-6 text-white hover:text-gold transition bg-white/10 p-2.5 rounded-full"
          >
            <X size={20} />
          </button>
          
          <div className="w-full max-w-3xl flex flex-col items-center">
            {lightboxItem.file_type === 'photo' ? (
              <img src={lightboxItem.file} className="max-h-[75vh] object-contain rounded border border-white/20" alt="Lightbox" />
            ) : (
              <video src={lightboxItem.file} className="max-h-[75vh] object-contain rounded border border-white/20" controls autoPlay />
            )}
            
            <div className="text-white text-center mt-6 space-y-1">
              <div className="font-bold text-sm">Shared by {lightboxItem.guest_name}</div>
              <div className="text-xs text-gold-light font-serif italic">Wedding Blessing Memory</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// PAGE: ADMIN CONSOLE (SUPERUSER CONTROLS)
// ==========================================
const AdminDashboard = ({ setToast }) => {
  const [stats, setStats] = useState(null);
  const [listData, setListData] = useState({ events: [], payments: [], leads: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');

  const fetchAdminData = async () => {
    try {
      const st = await api.admin.getStats();
      setStats(st);
      
      const lists = await api.admin.getFiltersList();
      setListData(lists);
      
      setLoading(false);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-maroon" size={36} />
        <span className="text-xs text-ink-muted">Opening Admin Console...</span>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 md:px-12 max-w-6xl mx-auto space-y-8">
      <div className="border-b border-cream-dark pb-6">
        <h1 className="font-serif text-3xl text-maroon-dark font-bold flex items-center gap-2">
          <span>🪬</span>
          <span>Shaadi QR Administration Console</span>
        </h1>
        <p className="text-ink-muted text-xs mt-1">Overall platform analytics, billing, customer leads, and wedding hosting lists.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs font-semibold text-ink">
          <div className="bg-white p-4 border border-cream-dark rounded-radius">
            <div className="text-gray-400">Total Hosts</div>
            <div className="text-2xl font-serif font-bold text-maroon-dark mt-1">{stats.total_hosts}</div>
          </div>
          <div className="bg-white p-4 border border-cream-dark rounded-radius">
            <div className="text-gray-400">Wedding Albums</div>
            <div className="text-2xl font-serif font-bold text-maroon-dark mt-1">{stats.total_events}</div>
          </div>
          <div className="bg-white p-4 border border-cream-dark rounded-radius">
            <div className="text-gray-400">Photos/Videos</div>
            <div className="text-2xl font-serif font-bold text-maroon-dark mt-1">{stats.total_uploads}</div>
          </div>
          <div className="bg-white p-4 border border-cream-dark rounded-radius">
            <div className="text-gray-400">Guest Blessings</div>
            <div className="text-2xl font-serif font-bold text-maroon-dark mt-1">{stats.total_wishes}</div>
          </div>
          <div className="bg-white p-4 border border-cream-dark rounded-radius">
            <div className="text-gray-400">Storage Used</div>
            <div className="text-2xl font-serif font-bold text-maroon-dark mt-1">{stats.total_storage_gb} GB</div>
          </div>
          <div className="bg-white p-4 border border-cream-dark rounded-radius">
            <div className="text-gray-400">Revenue (INR)</div>
            <div className="text-2xl font-serif font-bold text-green-700 mt-1">₹{stats.total_revenue}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-cream-dark text-xs font-semibold">
        <button 
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 border-b-2 transition ${
            activeTab === 'events' ? 'border-maroon text-maroon-dark' : 'border-transparent text-ink-muted'
          }`}
        >
          All Wedding Events ({listData.events.length})
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-3 border-b-2 transition ${
            activeTab === 'payments' ? 'border-maroon text-maroon-dark' : 'border-transparent text-ink-muted'
          }`}
        >
          Payments Receipts ({listData.payments.length})
        </button>
        <button 
          onClick={() => setActiveTab('leads')}
          className={`px-6 py-3 border-b-2 transition ${
            activeTab === 'leads' ? 'border-maroon text-maroon-dark' : 'border-transparent text-ink-muted'
          }`}
        >
          Customer Leads ({listData.leads.length})
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="bg-white rounded-radius border border-cream-dark overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/40 border-b border-cream-dark text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Wedding Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Date</th>
                <th className="p-4">Location</th>
                <th className="p-4">Active Plan</th>
                <th className="p-4">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {listData.events.map(ev => (
                <tr key={ev.id} className="border-b border-cream-dark hover:bg-cream/10 last:border-none">
                  <td className="p-4 font-bold text-maroon-dark">{ev.name}</td>
                  <td className="p-4 text-gray-400">/e/{ev.slug}</td>
                  <td className="p-4">{ev.date}</td>
                  <td className="p-4">{ev.location}</td>
                  <td className="p-4 font-semibold text-gold-dark">{ev.package_name}</td>
                  <td className="p-4">{ev.expiry_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-radius border border-cream-dark overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/40 border-b border-cream-dark text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Invoice No</th>
                <th className="p-4">Client Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Package</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Gateway Mode</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {listData.payments.map(pay => (
                <tr key={pay.id} className="border-b border-cream-dark hover:bg-cream/10 last:border-none">
                  <td className="p-4 font-bold text-maroon-dark">{pay.invoice_number}</td>
                  <td className="p-4">{pay.billing_name}</td>
                  <td className="p-4">{pay.billing_email}</td>
                  <td className="p-4">{pay.package_name}</td>
                  <td className="p-4 font-semibold text-green-700">₹{pay.amount}</td>
                  <td className="p-4 font-bold uppercase">{pay.razorpay_mode}</td>
                  <td className="p-4 font-bold text-green-800">{pay.status.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="space-y-4">
          {listData.leads.map(lead => (
            <div key={lead.id} className="bg-white p-6 rounded-radius border border-cream-dark shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-maroon-dark">{lead.name} ({lead.email})</span>
                <span className="text-gray-400">{new Date(lead.created_at).toLocaleString()}</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed font-serif">"{lead.message}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENT: MAIN APP ROUTER
// ==========================================
export default function App() {
  const [user, setUser] = useState(api.auth.getCurrentUser());
  const [toast, setToast] = useState(null);

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setToast({ message: 'Logged out successfully.', type: 'success' });
  };

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col justify-between">
        <div>
          <Navigation user={user} onLogout={handleLogout} />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact setToast={setToast} />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login setUser={setUser} setToast={setToast} />} />
            <Route path="/register" element={<Register setToast={setToast} />} />
            <Route path="/forgot-password" element={<ForgotPassword setToast={setToast} />} />
            
            {/* Private Host Workspace */}
            <Route path="/dashboard" element={user ? <Dashboard setToast={setToast} /> : <Login setUser={setUser} setToast={setToast} />} />
            <Route path="/dashboard/events/:id" element={user ? <HostEventDetail setToast={setToast} /> : <Login setUser={setUser} setToast={setToast} />} />
            
            {/* Guest Portals */}
            <Route path="/e/:slug" element={<GuestUpload setToast={setToast} />} />
            <Route path="/gallery/:slug" element={<PublicGallery setToast={setToast} />} />
            
            {/* Admin Console */}
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard setToast={setToast} /> : <Login setUser={setUser} setToast={setToast} />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="bg-maroon-dark text-cream/70 border-t border-gold/15 py-12 px-6 md:px-12 text-xs">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="font-serif font-bold text-white text-lg flex items-center justify-center md:justify-start gap-1">
                <span>🪬</span>
                <span>Shaadi QR</span>
              </div>
              <p className="max-w-xs leading-relaxed text-cream/65">Preserving Indian wedding memories beautifully and privately with custom invitation codes.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-cream/80">
              <Link to="/about" className="hover:text-gold transition">About Us</Link>
              <Link to="/contact" className="hover:text-gold transition">Contact Support</Link>
              <Link to="/privacy" className="hover:text-gold transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gold transition">Terms & Conditions</Link>
            </div>
            
            <div className="text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} Shaadi QR. All rights reserved.</p>
              <p className="text-[10px] text-cream/40 mt-1">Made in India for wedding memories.</p>
            </div>
          </div>
        </footer>

        {/* Toast alerts */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </Router>
  );
}
