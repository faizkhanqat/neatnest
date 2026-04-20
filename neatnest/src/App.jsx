import { useState, useEffect, useCallback } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const PARTNERS = [
  { id: 1, name: "Priya Sharma", rating: 4.9, jobs: 312, distance: "1.2 km", avatar: "PS", specialty: "Deep Cleaning", tier: 4 },
  { id: 2, name: "Rahul Verma", rating: 4.7, jobs: 189, distance: "2.1 km", avatar: "RV", specialty: "Kitchen", tier: 3 },
  { id: 3, name: "Sunita Devi", rating: 4.8, jobs: 254, distance: "0.8 km", avatar: "SD", specialty: "Bathroom", tier: 4 },
  { id: 4, name: "Amit Kumar", rating: 4.5, jobs: 143, distance: "3.4 km", avatar: "AK", specialty: "General", tier: 2 },
  { id: 5, name: "Meena Joshi", rating: 4.6, jobs: 97, distance: "1.9 km", avatar: "MJ", specialty: "Cleaning", tier: 2 },
];

const SERVICES = [
  { id: "cleaning", label: "Home Cleaning", icon: "🏠", base: 599 },
  { id: "kitchen", label: "Kitchen Deep Clean", icon: "🍳", base: 799 },
  { id: "bathroom", label: "Bathroom Sanitization", icon: "🚿", base: 499 },
];

const ADDONS = [
  { id: "deep", label: "Deep Cleaning", price: 299 },
  { id: "kitchen_addon", label: "Inside Appliances", price: 199 },
  { id: "disinfect", label: "Disinfection Spray", price: 149 },
  { id: "window", label: "Window Cleaning", price: 249 },
];

const TIME_SLOTS = ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"];

const PLANS = [
  { id: "basic", name: "Basic", price: 349, color: "#64748b", features: ["4 service/month", "Standard partners", "Email support", "NeatPoints 1x"] },
  { id: "standard", name: "Standard", price: 749, color: "#0ea5e9", popular: true, features: ["8 services/month", "Preferred partners", "Priority support", "NeatPoints 2x", "Free re-service"] },
  { id: "premium", name: "Premium", price: 1199, color: "#10b981", features: ["12 services/month", "Highly skilled partners", "Priority support", "NeatPoints 3x", "Free re-service", "Same-day booking"] },
  { id: "pro", name: "Pro", price: 1699, color: "rgb(17, 198, 62)", features: ["16 services/month", "Top-rated partners", "24/7 support", "NeatPoints 4x", "Free re-service", "Same-day booking"] },
];

const BOOKING_HISTORY = [
  { id: "BK001", service: "Home Cleaning", date: "Apr 12, 2026", partner: "Priya Sharma", status: "Completed", rating: 5 },
  { id: "BK002", service: "Kitchen Deep Clean", date: "Mar 28, 2026", partner: "Rahul Verma", status: "Completed", rating: 4 },
  { id: "BK003", service: "Bathroom Sanitization", date: "Mar 14, 2026", partner: "Sunita Devi", status: "Completed", rating: 5 },
];

const TRAINING_MODULES = [
  { id: 1, title: "Safety & Hygiene Standards", duration: "45 min", status: "completed" },
  { id: 2, title: "Customer Communication", duration: "30 min", status: "completed" },
  { id: 3, title: "Advanced Cleaning Techniques", duration: "60 min", status: "completed" },
  { id: 4, title: "Eco-Friendly Products Usage", duration: "30 min", status: "pending" },
  { id: 5, title: "Premium Service Delivery", duration: "45 min", status: "pending" },
];

const ADMIN_METRICS = [
  { label: "Repeat Rate", value: "68%", change: "+4.2%", up: true },
  { label: "Cancellation Rate", value: "3.1%", change: "-1.8%", up: true },
  { label: "Avg. CAC", value: "₹312", change: "-₹28", up: true },
  { label: "Avg. Order Value", value: "₹847", change: "+₹63", up: true },
];

const HIGH_DEMAND = ["Mon 8-10 AM", "Sat 10 AM-12 PM", "Sun 8-11 AM", "Fri 4-7 PM"];

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, addToast };
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{t.type === "success" ? "✓" : t.type === "warning" ? "⚠" : "ℹ"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly }) {
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          className={`star ${s <= value ? "filled" : ""} ${!readonly ? "interactive" : ""}`}
          onClick={() => !readonly && onChange && onChange(s)}
        >★</span>
      ))}
    </div>
  );
}

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────
function MiniBarChart({ data, color = "#10b981" }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div className="mini-chart">
      {data.map((d, i) => (
        <div key={i} className="mini-bar-wrap">
          <div className="mini-bar" style={{ height: `${(d.v / max) * 100}%`, background: color }} />
          <span className="mini-bar-label">{d.l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activePanel, setActivePanel] = useState("customer");
  const { toasts, addToast } = useToast();

  // Customer state
  const [bookingStep, setBookingStep] = useState("home"); // home | book | confirm | rate | done
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [assignedPartner, setAssignedPartner] = useState(null);
  const [matchReason, setMatchReason] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [neatPoints, setNeatPoints] = useState(480);
  const [bookingHistory, setBookingHistory] = useState(BOOKING_HISTORY);
  const [referralCopied, setReferralCopied] = useState(false);

  // Admin state
  const [peakPricing, setPeakPricing] = useState(true);

  // Partner state
  const [partnerData] = useState({
    name: "Priya Sharma", rating: 4.9, jobs: 312, earnings: 28450,
    tier: 4, acceptance: 96,
    ratingTrend: [
      { l: "Nov", v: 4.6 }, { l: "Dec", v: 4.7 }, { l: "Jan", v: 4.8 },
      { l: "Feb", v: 4.7 }, { l: "Mar", v: 4.9 }, { l: "Apr", v: 4.9 },
    ],
  });

  const serviceObj = SERVICES.find(s => s.id === selectedService);
  const addonTotal = selectedAddons.reduce((sum, aid) => {
    const a = ADDONS.find(x => x.id === aid);
    return sum + (a ? a.price : 0);
  }, 0);
  const totalPrice = (serviceObj?.base || 0) + addonTotal;

  function handleAutoAssign() {
    const sorted = [...PARTNERS].sort((a, b) => b.rating - a.rating);
    setAssignedPartner(sorted[0]);
    setMatchReason("Matched based on ⭐ rating (4.9), 📍 distance (0.8 km), and 🔁 repeat preference");
    addToast("Best partner matched successfully!", "success");
  }

  function handleConfirmBooking() {
    if (!selectedService || !selectedDate || !selectedTime || !assignedPartner) {
      addToast("Please fill all booking details", "warning");
      return;
    }
    const newBooking = {
      id: `BK00${bookingHistory.length + 4}`,
      service: serviceObj?.label,
      date: selectedDate,
      partner: assignedPartner.name,
      status: "Upcoming",
      rating: 0,
    };
    setBookingHistory(h => [newBooking, ...h]);
    setNeatPoints(p => p + 150);
    addToast("+150 NeatPoints earned! 🎉", "success");
    setBookingStep("rate");
  }

  function handleRating() {
    if (userRating === 0) { addToast("Please select a rating", "warning"); return; }
    if (userRating < 4) {
      addToast("Free Re-service triggered! Our team will contact you. 🔄", "warning");
    } else {
      addToast("Thank you for your feedback! ⭐", "success");
    }
    setBookingStep("done");
  }

  function resetBooking() {
    setBookingStep("book");
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedAddons([]);
    setAssignedPartner(null);
    setMatchReason("");
    setUserRating(0);
  }

  function toggleAddon(id) {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleReferral() {
    setReferralCopied(true);
    addToast("Referral code NEAT2026 copied! 🎁", "success");
    setTimeout(() => setReferralCopied(false), 2500);
  }

  return (
    <div className="app">
      <ToastContainer toasts={toasts} />

      {/* TOP NAV */}
      <nav className="nav">
        <div className="nav-brand">
          <span className="brand-icon"></span>
          <span className="brand-name">NeatNest</span>
        </div>
        <div className="nav-tabs">
          {[
            { id: "customer", label: "Customer" },
            { id: "partner", label: "Partner" },
            { id: "admin", label: "Admin" },
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activePanel === tab.id ? "active" : ""}`}
              onClick={() => setActivePanel(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="nav-points">
          <span className="points-badge">⚡ {neatPoints} pts</span>
        </div>
      </nav>

      {/* PANELS */}
      <main className="main">
        {activePanel === "customer" && (
          <CustomerPanel
            bookingStep={bookingStep} setBookingStep={setBookingStep}
            selectedService={selectedService} setSelectedService={setSelectedService}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            selectedTime={selectedTime} setSelectedTime={setSelectedTime}
            selectedAddons={selectedAddons} toggleAddon={toggleAddon}
            assignedPartner={assignedPartner} matchReason={matchReason}
            handleAutoAssign={handleAutoAssign} handleConfirmBooking={handleConfirmBooking}
            userRating={userRating} setUserRating={setUserRating} handleRating={handleRating}
            neatPoints={neatPoints} bookingHistory={bookingHistory}
            referralCopied={referralCopied} handleReferral={handleReferral}
            totalPrice={totalPrice} serviceObj={serviceObj} resetBooking={resetBooking}
            addToast={addToast}
          />
        )}
        {activePanel === "partner" && <PartnerPanel data={partnerData} addToast={addToast} />}
        {activePanel === "admin" && <AdminPanel peakPricing={peakPricing} setPeakPricing={setPeakPricing} addToast={addToast} />}
      </main>
    </div>
  );
}

// ─── CUSTOMER PANEL ───────────────────────────────────────────────────────────
function CustomerPanel({
  bookingStep, setBookingStep,
  selectedService, setSelectedService,
  selectedDate, setSelectedDate,
  selectedTime, setSelectedTime,
  selectedAddons, toggleAddon,
  assignedPartner, matchReason, handleAutoAssign, handleConfirmBooking,
  userRating, setUserRating, handleRating,
  neatPoints, bookingHistory, referralCopied, handleReferral,
  totalPrice, serviceObj, resetBooking, addToast,
}) {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="panel customer-panel">
      <div className="sub-tabs">
        {["home", "book", "history", "plans"].map(t => (
          <button key={t} className={`sub-tab ${activeTab === t ? "active" : ""}`}
            onClick={() => { setActiveTab(t); if (t === "book") setBookingStep("book"); }}>
            {{ home: "🏠 Home", book: "📅 Book", history: "📋 History", plans: "💎 Plans" }[t]}
          </button>
        ))}
      </div>

      {activeTab === "home" && <CustomerHome setActiveTab={setActiveTab} setBookingStep={setBookingStep} neatPoints={neatPoints} referralCopied={referralCopied} handleReferral={handleReferral} addToast={addToast} />}
      {activeTab === "book" && (
        <BookingFlow
          step={bookingStep}
          selectedService={selectedService} setSelectedService={setSelectedService}
          selectedDate={selectedDate} setSelectedDate={setSelectedDate}
          selectedTime={selectedTime} setSelectedTime={setSelectedTime}
          selectedAddons={selectedAddons} toggleAddon={toggleAddon}
          assignedPartner={assignedPartner} matchReason={matchReason}
          handleAutoAssign={handleAutoAssign} handleConfirmBooking={handleConfirmBooking}
          userRating={userRating} setUserRating={setUserRating} handleRating={handleRating}
          totalPrice={totalPrice} serviceObj={serviceObj}
          resetBooking={resetBooking}
          setStep={setBookingStep}
        />
      )}
      {activeTab === "history" && <BookingHistory history={bookingHistory} setActiveTab={setActiveTab} setBookingStep={setBookingStep} />}
      {activeTab === "plans" && <PlansSection addToast={addToast} />}
    </div>
  );
}

function CustomerHome({ setActiveTab, setBookingStep, neatPoints, referralCopied, handleReferral, addToast }) {
  const milestone = neatPoints >= 500 ? "🎁 Free service unlocked!" : `${500 - neatPoints} pts to free service`;

  return (
    <div className="home-section">
      {/* Hero */}
      <div className="hero-card">
        <div className="hero-content">
          <div className="hero-badge">⭐ 4.8 · 50,000+ Happy Homes</div>
          <h1 className="hero-title">Trusted Home Services<br /><span className="accent">with Guaranteed Quality</span></h1>
          <p className="hero-sub">We don't compete on price. We compete on trust, consistency, and experience.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => { setActiveTab("book"); setBookingStep("book"); }}>📅 Book a Service</button>
            <button className="btn-outline" onClick={() => setActiveTab("plans")}>💎 View Plans</button>
          </div>
        </div>
        <div className="hero-badges-wrap">
          <div className="trust-badge">🔄 Free Re-service</div>
          <div className="trust-badge">🤝 Same Partner</div>
          <div className="trust-badge">✅ Verified Pros</div>
          <div className="trust-badge">⚡ Same Day</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {[["50K+", "Homes Cleaned"], ["4.8★", "Avg Rating"], ["98%", "Satisfaction"], ["₹0", "Cancellation Fee"]].map(([v, l]) => (
          <div className="stat-card" key={l}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
        ))}
      </div>

      {/* Loyalty + Referral */}
      <div className="two-col">
        <div className="card">
          <div className="card-header">⚡ NeatPoints</div>
          <div className="loyalty-points">{neatPoints}</div>
          <div className="progress-wrap">
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min((neatPoints / 500) * 100, 100)}%` }} /></div>
            <span className="progress-label">{milestone}</span>
          </div>
          <div className="reward-list">
            <div className={`reward-item ${neatPoints >= 200 ? "unlocked" : ""}`}>🎟 200 pts — ₹50 off</div>
            <div className={`reward-item ${neatPoints >= 350 ? "unlocked" : ""}`}>🧹 350 pts — Free add-on</div>
            <div className={`reward-item ${neatPoints >= 500 ? "unlocked" : ""}`}>🎁 500 pts — Free service</div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">🎁 Refer &amp; Earn</div>
          <p className="card-sub">Invite friends and earn <strong>200 NeatPoints</strong> per referral.</p>
          <div className="referral-code">NEAT2026</div>
          <button className={`btn-primary full-w ${referralCopied ? "btn-copied" : ""}`} onClick={handleReferral}>
            {referralCopied ? "✓ Code Copied!" : "📋 Copy &amp; Invite Friends"}
          </button>
          <p className="card-note">Friend gets ₹100 off their first booking!</p>
        </div>
      </div>

      {/* Quick Book */}
      <div className="card">
        <div className="card-header">🚀 Popular Services</div>
        <div className="services-grid">
          {SERVICES.map(s => (
            <div key={s.id} className="service-quick-card"
              onClick={() => { setActiveTab("book"); setBookingStep("book"); }}>
              <div className="service-icon">{s.icon}</div>
              <div className="service-name">{s.label}</div>
              <div className="service-price">from ₹{s.base}</div>
              <button className="btn-sm">Book Now</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingFlow({
  step, setStep,
  selectedService, setSelectedService,
  selectedDate, setSelectedDate,
  selectedTime, setSelectedTime,
  selectedAddons, toggleAddon,
  assignedPartner, matchReason, handleAutoAssign, handleConfirmBooking,
  userRating, setUserRating, handleRating,
  totalPrice, serviceObj, resetBooking,
}) {
  const dates = ["Apr 21, 2026", "Apr 22, 2026", "Apr 23, 2026", "Apr 24, 2026", "Apr 25, 2026"];

  if (step === "rate") return (
    <div className="flow-wrap">
      <div className="card flow-card">
        <div className="flow-icon">⭐</div>
        <h2 className="flow-title">Rate Your Service</h2>
        <p className="flow-sub">How was your experience with <strong>{assignedPartner?.name}</strong>?</p>
        <StarRating value={userRating} onChange={setUserRating} />
        {userRating > 0 && userRating < 4 && (
          <div className="alert alert-warning">⚠ Rating below 4 — Free Re-service will be triggered!</div>
        )}
        {userRating >= 4 && <div className="alert alert-success">🎉 Great! Your feedback helps us improve.</div>}
        <button className="btn-primary full-w" onClick={handleRating}>Submit Rating</button>
      </div>
    </div>
  );

  if (step === "done") return (
    <div className="flow-wrap">
      <div className="card flow-card">
        <div className="flow-icon">✅</div>
        <h2 className="flow-title">Booking Complete!</h2>
        <p className="flow-sub">Your service has been confirmed and you've earned <strong>+150 NeatPoints</strong>!</p>
        <div className="booking-summary-box">
          <div className="summary-row"><span>Service</span><strong>{serviceObj?.label}</strong></div>
          <div className="summary-row"><span>Partner</span><strong>{assignedPartner?.name}</strong></div>
          <div className="summary-row"><span>Date</span><strong>{selectedDate}</strong></div>
          <div className="summary-row"><span>Time</span><strong>{selectedTime}</strong></div>
          <div className="summary-row total"><span>Total Paid</span><strong>₹{totalPrice}</strong></div>
        </div>
        <button className="btn-primary full-w" onClick={resetBooking}>🔁 Book Again</button>
      </div>
    </div>
  );

  return (
    <div className="booking-layout">
      {/* Left: Booking Form */}
      <div className="booking-form">
        {/* Step 1: Service */}
        <div className="card step-card">
          <div className="step-label"><span className="step-num">1</span> Select Service</div>
          <div className="services-list">
            {SERVICES.map(s => (
              <div key={s.id} className={`service-option ${selectedService === s.id ? "selected" : ""}`}
                onClick={() => setSelectedService(s.id)}>
                <span className="svc-icon">{s.icon}</span>
                <div><div className="svc-name">{s.label}</div><div className="svc-price">₹{s.base}</div></div>
                {selectedService === s.id && <span className="check">✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Date/Time */}
        <div className="card step-card">
          <div className="step-label"><span className="step-num">2</span> Select Date &amp; Time</div>
          <div className="date-time-row">
            <select className="select-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
              <option value="">-- Select Date --</option>
              {dates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="select-input" value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
              <option value="">-- Select Time --</option>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Step 3: Add-ons */}
        <div className="card step-card">
          <div className="step-label"><span className="step-num">3</span> Add-ons</div>
          <div className="addons-list">
            {ADDONS.map(a => (
              <label key={a.id} className={`addon-item ${selectedAddons.includes(a.id) ? "selected" : ""}`}>
                <input type="checkbox" checked={selectedAddons.includes(a.id)} onChange={() => toggleAddon(a.id)} />
                <span className="addon-name">{a.label}</span>
                <span className="addon-price">+₹{a.price}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Step 4: AI Match */}
        <div className="card step-card">
          <div className="step-label"><span className="step-num">4</span> Partner Matching</div>
          {!assignedPartner ? (
            <div className="match-empty">
              <p>Let our AI find the best partner for your service.</p>
              <button className="btn-primary" onClick={handleAutoAssign}>🤖 Auto Assign Best Match</button>
            </div>
          ) : (
            <div className="matched-partner">
              <div className="partner-avatar">{assignedPartner.avatar}</div>
              <div className="partner-info">
                <div className="partner-name">{assignedPartner.name}</div>
                <StarRating value={Math.floor(assignedPartner.rating)} readonly />
                <div className="partner-meta">{assignedPartner.rating}★ · {assignedPartner.jobs} jobs · {assignedPartner.distance}</div>
              </div>
              <span className="tier-badge tier-{assignedPartner.tier}">T{assignedPartner.tier}</span>
            </div>
          )}
          {matchReason && <div className="match-reason">{matchReason}</div>}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="order-summary">
        <div className="card summary-card">
          <div className="card-header">📋 Order Summary</div>
          <div className="summary-line">
            <span>{serviceObj?.label || "No service selected"}</span>
            <span>₹{serviceObj?.base || 0}</span>
          </div>
          {selectedAddons.map(aid => {
            const a = ADDONS.find(x => x.id === aid);
            return a ? <div key={aid} className="summary-line addon">
              <span>{a.label}</span><span>+₹{a.price}</span>
            </div> : null;
          })}
          <div className="summary-divider" />
          <div className="summary-line total">
            <span>Total</span><strong>₹{totalPrice}</strong>
          </div>
          <div className="points-earn">You'll earn: <strong>+150 NeatPoints</strong></div>
          <button className="btn-primary full-w confirm-btn" onClick={handleConfirmBooking}>
            Confirm Booking →
          </button>

          {/* Available Partners */}
          <div className="avail-header">Available Partners</div>
          {PARTNERS.map(p => (
            <div key={p.id} className={`avail-partner ${assignedPartner?.id === p.id ? "highlighted" : ""}`}>
              <div className="avail-avatar">{p.avatar}</div>
              <div className="avail-info">
                <div className="avail-name">{p.name}</div>
                <div className="avail-meta">{p.rating}★ · {p.distance}</div>
              </div>
              <div className={`tier-pill tier-${p.tier}`}>T{p.tier}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingHistory({ history, setActiveTab, setBookingStep }) {
  return (
    <div className="history-section">
      <div className="section-header">
        <h2>Your Bookings</h2>
        <button className="btn-primary" onClick={() => { setActiveTab("book"); setBookingStep("book"); }}>+ New Booking</button>
      </div>
      {history.map(b => (
        <div key={b.id} className="history-card">
          <div className="history-left">
            <div className="history-id">{b.id}</div>
            <div className="history-service">{b.service}</div>
            <div className="history-meta">{b.date} · {b.partner}</div>
          </div>
          <div className="history-right">
            <span className={`status-chip ${b.status === "Completed" ? "done" : "upcoming"}`}>{b.status}</span>
            {b.rating > 0 && <StarRating value={b.rating} readonly />}
            <button className="btn-sm" onClick={() => { setActiveTab("book"); setBookingStep("book"); }}>🔁 Rebook</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlansSection({ addToast }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="plans-section">
      <div className="plans-header">
        <h2>Choose Your Plan</h2>
        <p>Save more with a subscription. Cancel anytime.</p>
      </div>
      <div className="plans-grid">
        {PLANS.map(p => (
          <div key={p.id} className={`plan-card ${p.popular ? "popular" : ""} ${selected === p.id ? "selected-plan" : ""}`}>
            {p.popular && <div className="popular-badge">⭐ Most Popular</div>}
            <div className="plan-name">{p.name}</div>
            <div className="plan-price">₹{p.price}<span>/mo</span></div>
            <ul className="plan-features">
              {p.features.map(f => <li key={f}>✓ {f}</li>)}
            </ul>
            <button className={`btn-primary full-w ${selected === p.id ? "subscribed" : ""}`}
              onClick={() => { setSelected(p.id); addToast(`Subscribed to ${p.name} plan! 🎉`, "success"); }}>
              {selected === p.id ? "✓ Subscribed!" : "Subscribe Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PARTNER PANEL ────────────────────────────────────────────────────────────
function PartnerPanel({ data, addToast }) {
  const tiers = [
    { n: 1, label: "Starter", req: "< 50 jobs", color: "#64748b" },
    { n: 2, label: "Skilled", req: "50+ jobs, 4.2★", color: "#3b82f6" },
    { n: 3, label: "Pro", req: "150+ jobs, 4.5★", color: "#8b5cf6" },
    { n: 4, label: "Elite", req: "250+ jobs, 4.8★", color: "#10b981" },
  ];

  return (
    <div className="panel partner-panel">
      <div className="partner-hero">
        <div className="partner-hero-avatar">{data.name.split(" ").map(n => n[0]).join("")}</div>
        <div>
          <h2 className="partner-hero-name">{data.name}</h2>
          <StarRating value={Math.floor(data.rating)} readonly />
          <p className="partner-hero-sub">Elite Partner · Member since Jan 2024</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        {[
          ["₹" + data.earnings.toLocaleString("en-IN"), "Total Earnings", "💰"],
          [data.jobs, "Jobs Completed", "✅"],
          [data.rating + "★", "Avg Rating", "⭐"],
          [data.acceptance + "%", "Acceptance Rate", "📊"],
        ].map(([v, l, icon]) => (
          <div className="kpi-card" key={l}>
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-val">{v}</div>
            <div className="kpi-lbl">{l}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Tier System */}
        <div className="card">
          <div className="card-header">🏆 Partner Tier</div>
          <div className="tiers-list">
            {tiers.map(t => (
              <div key={t.n} className={`tier-row ${data.tier === t.n ? "current-tier" : ""}`}>
                <div className="tier-circle" style={{ background: t.color }}>T{t.n}</div>
                <div className="tier-info">
                  <div className="tier-name">{t.label}</div>
                  <div className="tier-req">{t.req}</div>
                </div>
                {data.tier === t.n && <span className="current-label">Current</span>}
                {data.tier === t.n - 1 && <span className="next-label">Next →</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Rating Trend */}
        <div className="card">
          <div className="card-header">📈 Rating Trend</div>
          <MiniBarChart data={data.ratingTrend} color="#10b981" />
          <div className="chart-note">Last 6 months performance</div>
        </div>
      </div>

      {/* Training */}
      <div className="card">
        <div className="card-header">🎓 Training Modules</div>
        <div className="modules-list">
          {TRAINING_MODULES.map(m => (
            <div key={m.id} className={`module-item ${m.status}`}>
              <div className="module-icon">{m.status === "completed" ? "✅" : "⏳"}</div>
              <div className="module-info">
                <div className="module-title">{m.title}</div>
                <div className="module-meta">{m.duration}</div>
              </div>
              <span className={`module-status ${m.status}`}>{m.status === "completed" ? "Completed" : "Pending"}</span>
              {m.status === "pending" && (
                <button className="btn-sm" onClick={() => addToast("Opening module...", "info")}>Start</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminPanel({ peakPricing, setPeakPricing, addToast }) {
  const [campaignSent, setCampaignSent] = useState({});

  function sendCampaign(name) {
    setCampaignSent(p => ({ ...p, [name]: true }));
    addToast(`${name} campaign pushed to 12,400 users! 📢`, "success");
  }

  const chartData = [
    { l: "Mon", v: 87 }, { l: "Tue", v: 62 }, { l: "Wed", v: 78 },
    { l: "Thu", v: 95 }, { l: "Fri", v: 110 }, { l: "Sat", v: 142 }, { l: "Sun", v: 131 },
  ];

  return (
    <div className="panel admin-panel">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <span className="live-badge">● Live</span>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {ADMIN_METRICS.map(m => (
          <div className="metric-card" key={m.label}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className={`metric-change ${m.up ? "up" : "down"}`}>{m.change} this month</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Weekly Bookings Chart */}
        <div className="card">
          <div className="card-header">📊 Weekly Bookings</div>
          <MiniBarChart data={chartData} color="#0ea5e9" />
          <div className="chart-note">Bookings per day this week</div>
        </div>

        {/* Smart Scheduling */}
        <div className="card">
          <div className="card-header">⚙️ Smart Scheduling</div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Peak Pricing</div>
              <div className="toggle-sub">Automatically adjust prices during high demand</div>
            </div>
            <button className={`toggle-btn ${peakPricing ? "on" : "off"}`}
              onClick={() => { setPeakPricing(p => !p); addToast(`Peak pricing ${!peakPricing ? "enabled" : "disabled"}`, "info"); }}>
              {peakPricing ? "ON" : "OFF"}
            </button>
          </div>
          <div className="demand-header">🔥 High Demand Slots</div>
          <div className="demand-slots">
            {HIGH_DEMAND.map(slot => (
              <div key={slot} className="demand-chip">{slot}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* AI Matching Factors */}
        <div className="card">
          <div className="card-header">🤖 AI Matching Factors</div>
          <div className="factors-list">
            {[
              ["Rating", 40, "#10b981"],
              ["Distance", 30, "#0ea5e9"],
              ["Availability", 20, "#f59e0b"],
              ["Repeat Pref.", 10, "#8b5cf6"],
            ].map(([label, pct, color]) => (
              <div key={label} className="factor-row">
                <span className="factor-label">{label}</span>
                <div className="factor-bar-wrap">
                  <div className="factor-bar" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="factor-pct">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaigns */}
        <div className="card">
          <div className="card-header">📢 Campaign Controls</div>
          <p className="card-sub">Push targeted campaigns to your user base.</p>
          <div className="campaigns-list">
            {[
              { id: "offer", label: "🎯 Push Flash Offer", sub: "₹100 off — expires in 2 hrs" },
              { id: "sub", label: "💎 Promote Subscription", sub: "Standard plan — ₹999/mo" },
              { id: "loyalty", label: "⚡ Boost Loyalty", sub: "Double NeatPoints weekend" },
            ].map(c => (
              <div key={c.id} className="campaign-item">
                <div>
                  <div className="campaign-label">{c.label}</div>
                  <div className="campaign-sub">{c.sub}</div>
                </div>
                <button
                  className={`btn-sm campaign-btn ${campaignSent[c.id] ? "sent" : ""}`}
                  onClick={() => sendCampaign(c.label)}
                >
                  {campaignSent[c.id] ? "✓ Sent" : "Push"}
                </button>
              </div>
            ))}
          </div>

          {/* Partner Stats */}
          <div className="card-header" style={{ marginTop: "1.5rem" }}>👥 Partner Overview</div>
          <div className="partner-stats">
            {[["142", "Active Partners"], ["28", "New This Month"], ["94%", "On-time Rate"]].map(([v, l]) => (
              <div className="pstat" key={l}><div className="pstat-val">{v}</div><div className="pstat-lbl">{l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
