import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MapPin, Zap, User, ChevronLeft, Plus, Minus,
  Radio, Clock, Shield, ChevronRight, X, Settings,
  Navigation2, Bell,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "home" | "parkDetail" | "profile";
type NavTab = "parks" | "popups" | "account";
type SkillLevel = "3.0" | "3.5" | "4.0+";
type Duration = "2h" | "3h" | "sunset";

// ─── Static data ──────────────────────────────────────────────────────────────

const CHECKINS = [
  { name: "Sarah K.", skill: "3.5", time: "14m ago", initials: "SK", hue: "emerald" },
  { name: "Marcus T.", skill: "4.0", time: "22m ago", initials: "MT", hue: "blue" },
  { name: "Priya N.", skill: "3.0", time: "31m ago", initials: "PN", hue: "violet" },
  { name: "Jonah L.", skill: "3.5", time: "47m ago", initials: "JL", hue: "amber" },
  { name: "Deb W.", skill: "4.0+", time: "1h 2m ago", initials: "DW", hue: "rose" },
];

const POPUPS = [
  { id: 1, park: "Riverside Park", spot: "Baseball diamond grass", need: 2, skill: "Any", ttl: "2h 14m", distance: "0.4 mi" },
  { id: 2, park: "Dolores Park", spot: "North end, court 3", need: 1, skill: "3.5+", ttl: "1h 02m", distance: "1.1 mi" },
  { id: 3, park: "McLaren Park", spot: "Center pavilion", need: 3, skill: "3.0+", ttl: "45m", distance: "2.3 mi" },
];

const AVATAR_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/25",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/25",
  violet: "bg-violet-500/20 text-violet-400 border-violet-500/25",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/25",
  rose: "bg-rose-500/20 text-rose-400 border-rose-500/25",
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTab, setActiveTab] = useState<NavTab>("parks");
  const [showModal, setShowModal] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  // Modal state
  const [playersNeeded, setPlayersNeeded] = useState(2);
  const [duration, setDuration] = useState<Duration>("3h");
  const [location, setLocation] = useState("");

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === "account") setScreen("profile");
    else setScreen("home");
  };

  const handleBroadcast = () => {
    setBroadcastDone(true);
    setTimeout(() => {
      setBroadcastDone(false);
      setShowModal(false);
      setLocation("");
    }, 2400);
  };

  const goToPark = () => setScreen("parkDetail");
  const goHome = () => { setScreen("home"); setActiveTab("parks"); };

  return (
    <div
      className="min-h-screen bg-background text-foreground flex justify-center"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="relative w-full max-w-[430px] min-h-screen flex flex-col overflow-hidden">

        {/* Screen content */}
        <div className="flex-1 overflow-y-auto pb-[68px] overscroll-contain">
          <AnimatePresence mode="wait" initial={false}>
            {screen === "home" && activeTab === "parks" && (
              <motion.div key="home-parks"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2, ease: "easeOut" }}>
                <HomeParksScreen onCourtPress={goToPark} onHostPopup={() => setShowModal(true)} />
              </motion.div>
            )}
            {screen === "home" && activeTab === "popups" && (
              <motion.div key="home-popups"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2, ease: "easeOut" }}>
                <PopUpsScreen onJoin={() => setShowModal(true)} />
              </motion.div>
            )}
            {screen === "parkDetail" && (
              <motion.div key="park-detail"
                initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 32 }}
                transition={{ duration: 0.22, ease: "easeOut" }}>
                <ParkDetailScreen onBack={goHome} onHostPopup={() => setShowModal(true)} />
              </motion.div>
            )}
            {screen === "profile" && (
              <motion.div key="profile"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}>
                <ProfileScreen />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Host pop-up modal */}
        <AnimatePresence>
          {showModal && (
            <HostPopupModal
              playersNeeded={playersNeeded}
              setPlayersNeeded={setPlayersNeeded}
              duration={duration}
              setDuration={setDuration}
              location={location}
              setLocation={setLocation}
              broadcastDone={broadcastDone}
              onBroadcast={handleBroadcast}
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Screen 1A: Home → Parks tab ─────────────────────────────────────────────

function HomeParksScreen({ onCourtPress, onHostPopup }: { onCourtPress: () => void; onHostPopup: () => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-3">
          <Pill icon={<Navigation2 size={9} className="fill-primary text-primary" />} label="San Francisco, CA" />
          <Avatar initials="JD" size="sm" color="emerald" />
        </div>
        <h1 className="text-[44px] font-black leading-none tracking-tight text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Rally<span className="text-primary">Point</span>
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1.5">Find open play near you, right now.</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-5">
        <label className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 focus-within:border-primary/40 transition-colors cursor-text">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search courts, parks, zip code..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </label>
      </div>

      {/* Map placeholder */}
      <div className="px-5 mb-5">
        <div className="relative rounded-2xl overflow-hidden bg-[#162033] border border-border h-[148px] flex items-center justify-center">
          {/* Fake grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Fake map pins */}
          <div className="absolute top-[38%] left-[42%] flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-primary/15">
              <MapPin size={11} className="text-primary-foreground" />
            </div>
            <div className="text-[9px] font-bold text-primary mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>12</div>
          </div>
          <div className="absolute top-[55%] left-[65%] flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-slate-500/30">
              <MapPin size={9} className="text-slate-300" />
            </div>
            <div className="text-[9px] font-bold text-slate-400 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>0</div>
          </div>
          <div className="absolute top-[28%] left-[68%] flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-blue-500/30">
              <MapPin size={9} className="text-white" />
            </div>
            <div className="text-[9px] font-bold text-blue-400 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>5</div>
          </div>
          {/* You-are-here dot */}
          <div className="absolute top-[62%] left-[35%] w-3 h-3 rounded-full bg-white ring-2 ring-white/30 shadow-md" />
          {/* Map label */}
          <div className="absolute bottom-2.5 right-3 bg-background/70 backdrop-blur-sm px-2 py-1 rounded-lg border border-border">
            <span className="text-[9px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Live · 3 courts mapped</span>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <Mono className="text-[10px] text-muted-foreground">Nearby Courts &amp; Live Play</Mono>
        <Mono className="text-[10px] text-primary">3 nearby</Mono>
      </div>

      {/* Cards */}
      <div className="px-5 flex flex-col gap-3">

        {/* Riverside — active, has pop-up */}
        <button
          onClick={onCourtPress}
          className="w-full text-left bg-card border border-border rounded-2xl overflow-hidden active:scale-[0.985] transition-transform"
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-[22px] font-black leading-none text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Riverside Park</h3>
                <p className="text-[12px] text-muted-foreground mt-1">4 Hard Courts &nbsp;·&nbsp; ~2 games deep</p>
              </div>
              <ActiveBadge count={12} />
            </div>

            {/* Nested pop-up alert */}
            <div className="bg-[#0f172a] border border-amber-500/25 rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Zap size={11} className="text-amber-400 shrink-0" />
                  <Mono className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Active Pop-Up Net</Mono>
                </div>
                <p className="text-[12px] text-muted-foreground truncate">By baseball diamond &nbsp;·&nbsp; Need 2 players</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onHostPopup(); }}
                className="bg-primary text-primary-foreground text-[11px] font-black px-3 py-1.5 rounded-lg shrink-0 active:opacity-75 transition-opacity"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                JOIN +
              </button>
            </div>
          </div>

          {/* Foot strip */}
          <div className="px-4 py-2.5 bg-background/40 border-t border-border flex items-center gap-2.5">
            <AvatarStack initials={["SK", "MT", "PN"]} />
            <span className="text-[11px] text-muted-foreground">+9 checked in</span>
            <Mono className="ml-auto text-[10px] text-primary">TAP TO VIEW →</Mono>
          </div>
        </button>

        {/* Oak Street — quiet */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[22px] font-black leading-none text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Oak Street Courts</h3>
              <p className="text-[12px] text-muted-foreground mt-1">2 Hard Courts &nbsp;·&nbsp; Open access</p>
            </div>
            <QuietBadge />
          </div>
          <p className="text-[12px] text-muted-foreground mt-3 pt-3 border-t border-border">
            No active pop-ups &nbsp;·&nbsp; Last activity 2h ago
          </p>
        </div>

        {/* Marina Green — moderate */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[22px] font-black leading-none text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Marina Green</h3>
              <p className="text-[12px] text-muted-foreground mt-1">2 Temp Courts &nbsp;·&nbsp; Bay views</p>
            </div>
            <span className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/25 text-blue-400 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />5 Active
            </span>
          </div>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
}

// ─── Screen 1B: Home → Pop-Ups tab ───────────────────────────────────────────

function PopUpsScreen({ onJoin }: { onJoin: () => void }) {
  return (
    <div className="flex flex-col">
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={18} className="text-primary" />
          <h1 className="text-[34px] font-black leading-none text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Active Pop-Ups
          </h1>
        </div>
        <p className="text-[13px] text-muted-foreground">Live nets broadcasting near you</p>
      </div>

      {/* Live indicator */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <Mono className="text-[11px] text-emerald-400">3 active broadcasts within 3 miles</Mono>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {POPUPS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.2, ease: "easeOut" }}
            className="bg-card border border-amber-500/20 rounded-2xl p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Zap size={11} className="text-amber-400 shrink-0" />
                  <Mono className="text-[10px] text-amber-400 font-bold uppercase">Pop-Up Net Live</Mono>
                </div>
                <h3 className="text-[18px] font-black leading-tight text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{p.park}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">{p.spot}</p>
              </div>
              <Mono className="text-[11px] text-muted-foreground shrink-0">{p.distance}</Mono>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Tag>{p.need} {p.need === 1 ? "player" : "players"} needed</Tag>
              <Tag>Skill: {p.skill}</Tag>
              <Tag variant="warning">⏱ {p.ttl} left</Tag>
            </div>
            <button
              onClick={onJoin}
              className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-[13px] font-bold active:bg-primary/20 transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              JOIN THIS NET →
            </button>
          </motion.div>
        ))}
        <div className="h-2" />
      </div>
    </div>
  );
}

// ─── Screen 2: Park Detail ────────────────────────────────────────────────────

function ParkDetailScreen({ onBack, onHostPopup }: { onBack: () => void; onHostPopup: () => void }) {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#192640] to-background px-5 pt-14 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[12px] text-muted-foreground mb-5 active:text-foreground transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <ChevronLeft size={14} /> Back to map
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[38px] font-black leading-tight text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Riverside Park
            </h1>
            <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <MapPin size={11} className="shrink-0" />
              Golden Gate Ave &amp; Baker St
            </p>
          </div>
          <ActiveBadge count={12} />
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3">

        {/* Infrastructure grid */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <SectionLabel>Infrastructure</SectionLabel>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              ["Courts", "4 Hard"],
              ["Nets", "Permanent"],
              ["Lighting", "Until 10 PM"],
              ["Restrooms", "On-site"],
              ["Parking", "Free lot"],
              ["Shade", "Partial"],
            ].map(([k, v]) => (
              <div key={k} className="bg-background rounded-xl px-3 py-2.5">
                <Mono className="text-[10px] text-muted-foreground block mb-0.5">{k}</Mono>
                <Mono className="text-[13px] font-bold text-foreground">{v}</Mono>
              </div>
            ))}
          </div>
        </div>

        {/* Live check-ins */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Live Check-Ins</SectionLabel>
            <Mono className="text-[10px] text-primary">Updated 2m ago</Mono>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {CHECKINS.map(player => (
              <div key={player.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${AVATAR_COLORS[player.hue]}`}>
                    <Mono className="text-[11px] font-bold">{player.initials}</Mono>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground leading-tight">
                      {player.name} <span className="text-muted-foreground font-normal text-[12px]">({player.skill})</span>
                    </p>
                    <Mono className="text-[11px] text-muted-foreground">{player.time}</Mono>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {player.skill}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Host pop-up CTA */}
        <button
          onClick={onHostPopup}
          className="w-full bg-primary/8 border-2 border-dashed border-primary/30 rounded-2xl py-4 px-5 flex items-center justify-center gap-2.5 active:bg-primary/15 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Plus size={14} className="text-primary" />
          </div>
          <span className="font-bold text-primary text-[17px] tracking-wide" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>
            Host a Pop-Up Game Here
          </span>
        </button>

        {/* Etiquette */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-2">
          <SectionLabel>Court Etiquette</SectionLabel>
          <blockquote className="mt-3 border-l-2 border-primary/40 pl-4">
            <p className="text-[13px] text-foreground/70 leading-relaxed italic">
              "Riverside regulars rotate courts every two games when others are waiting.
              Score called from the center line — new players always welcome at any level."
            </p>
            <footer className="mt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <Mono className="text-[10px] text-muted-foreground">— Community notes · last updated Aug 2026</Mono>
            </footer>
          </blockquote>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
}

// ─── Screen 3: Host Pop-Up Modal ──────────────────────────────────────────────

function HostPopupModal({
  playersNeeded, setPlayersNeeded,
  duration, setDuration,
  location, setLocation,
  broadcastDone, onBroadcast, onClose,
}: {
  playersNeeded: number;
  setPlayersNeeded: (n: number) => void;
  duration: Duration;
  setDuration: (d: Duration) => void;
  location: string;
  setLocation: (s: string) => void;
  broadcastDone: boolean;
  onBroadcast: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Scrim */}
      <motion.div
        className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl px-6 pt-6 pb-10 flex flex-col gap-5"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 420, damping: 40 }}
      >
        {/* Drag pill */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-border" />

        {/* Title */}
        <div className="flex items-start justify-between pt-1">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                <Zap size={13} className="text-primary" />
              </div>
              <h2 className="text-[28px] font-black leading-none text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Host a Pop-Up Net
              </h2>
            </div>
            <p className="text-[12px] text-muted-foreground ml-8">Broadcast your spot instantly to nearby players</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center active:bg-muted shrink-0 mt-0.5"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Location input */}
        <div>
          <FieldLabel>Where are you set up?</FieldLabel>
          <label className="flex items-center gap-3 bg-background border border-border focus-within:border-primary/50 rounded-xl px-4 py-3.5 mt-2 transition-colors cursor-text">
            <MapPin size={14} className="text-muted-foreground shrink-0" />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Baseball diamond grass"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </label>
        </div>

        {/* Players stepper */}
        <div>
          <FieldLabel>Players Needed</FieldLabel>
          <div className="flex items-center gap-5 mt-2">
            <button
              onClick={() => setPlayersNeeded(Math.max(1, playersNeeded - 1))}
              className="w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center active:bg-muted transition-colors"
            >
              <Minus size={15} className="text-foreground" />
            </button>
            <div className="text-center min-w-[48px]">
              <span className="font-black text-[48px] leading-none text-primary" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {playersNeeded}
              </span>
              <Mono className="text-[10px] text-muted-foreground block mt-0.5">{playersNeeded === 1 ? "player" : "players"} to fill</Mono>
            </div>
            <button
              onClick={() => setPlayersNeeded(Math.min(8, playersNeeded + 1))}
              className="w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center active:bg-muted transition-colors"
            >
              <Plus size={15} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Duration toggles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel>Duration / TTL</FieldLabel>
            <Mono className="text-[10px] text-muted-foreground">auto-expires</Mono>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["2h", "3h", "sunset"] as Duration[]).map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`py-3 rounded-xl text-[12px] font-bold border transition-all ${
                  duration === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border active:bg-muted"
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {d === "sunset" ? "🌅 Sunset" : d}
                {d === "3h" && (
                  <span className={`block text-[9px] mt-0.5 ${duration === d ? "opacity-70" : "opacity-50"}`}>default</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Broadcast button */}
        <button
          onClick={onBroadcast}
          disabled={broadcastDone}
          className={`w-full py-4 rounded-2xl font-black text-[17px] tracking-widest transition-all active:scale-[0.98] ${
            broadcastDone
              ? "bg-emerald-600/90 text-white"
              : "bg-primary text-primary-foreground"
          }`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
        >
          {broadcastDone ? "✓  BROADCASTING NOW" : "⚡  BROADCAST POP-UP GAME"}
        </button>
      </motion.div>
    </>
  );
}

// ─── Screen 4: Profile & Settings ────────────────────────────────────────────

function ProfileScreen() {
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("3.5");
  const [geofencing, setGeofencing] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="flex flex-col">
      <div className="px-5 pt-14 pb-5">
        <Mono className="text-[10px] text-muted-foreground block mb-5">Profile &amp; Settings</Mono>

        {/* Identity */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 mb-3">
          <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/35 flex items-center justify-center shrink-0">
            <span className="font-black text-[22px] text-primary" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[28px] font-black leading-tight text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Jordan D.</h2>
            <Mono className="text-[11px] text-muted-foreground block truncate">@jordan_dink · Member since 2024</Mono>
            <div className="flex items-center gap-3 mt-1.5">
              <StatPill label="Games" value="34" />
              <StatPill label="Courts" value="12" />
            </div>
          </div>
        </div>

        {/* Skill level */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-3">
          <SectionLabel>Skill Level (UTPR)</SectionLabel>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {(["3.0", "3.5", "4.0+"] as SkillLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setSkillLevel(level)}
                className={`py-3 rounded-xl text-[13px] font-bold border transition-all ${
                  skillLevel === level
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border active:bg-muted"
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2.5">Shown to players you match with. Update after rating events.</p>
        </div>

        {/* Geofencing card */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Radio size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">Background Geofencing</p>
                <Mono className={`text-[11px] font-bold block ${geofencing ? "text-primary" : "text-muted-foreground"}`}>
                  {geofencing ? "Always Allow · Active" : "Disabled"}
                </Mono>
              </div>
            </div>
            <Toggle on={geofencing} onToggle={() => setGeofencing(v => !v)} />
          </div>

          <div className="bg-background rounded-xl p-3.5 flex flex-col gap-2.5">
            <GeoRow icon="⚡" accent="text-primary" title="Zero battery drain" body="OS-level region monitoring — no continuous GPS polling, ever" />
            <GeoRow icon="📍" accent="text-blue-400" title="Auto check-in" body="Silently checks you in when entering a registered court zone" />
            <GeoRow icon="⏱" accent="text-amber-400" title="3-hour safety TTL" body="Check-in expires automatically — your presence is never stale" />
          </div>
        </div>

        {/* Settings rows */}
        {[
          { Icon: Clock, label: "Check-in History", sub: "12 courts visited", isToggle: false },
          { Icon: Shield, label: "Privacy & Data", sub: "Manage visibility", isToggle: false },
          { Icon: Bell, label: "Notifications", sub: "Pop-ups near you", isToggle: true },
          { Icon: Settings, label: "App Settings", sub: "Display, sound, more", isToggle: false },
        ].map(row => (
          <div key={row.label} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between mb-2 cursor-pointer active:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                <row.Icon size={14} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">{row.label}</p>
                <Mono className="text-[11px] text-muted-foreground">{row.sub}</Mono>
              </div>
            </div>
            {row.isToggle
              ? <Toggle on={notifications} onToggle={() => setNotifications(v => !v)} />
              : <ChevronRight size={14} className="text-muted-foreground" />}
          </div>
        ))}

        <div className="h-2" />
      </div>
    </div>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────

function BottomNav({ activeTab, onTabChange }: { activeTab: NavTab; onTabChange: (t: NavTab) => void }) {
  const tabs = [
    { id: "parks" as NavTab, Icon: MapPin, label: "Parks" },
    { id: "popups" as NavTab, Icon: Zap, label: "Pop-Ups" },
    { id: "account" as NavTab, Icon: User, label: "Account" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-stretch">
        {tabs.map(({ id, Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3.5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              {active && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-primary rounded-full"
                />
              )}
              <Icon size={18} />
              <Mono className={`text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>{label}</Mono>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function Mono({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={className} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Mono className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
      {children}
    </Mono>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Mono className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground block">
      {children}
    </Mono>
  );
}

function ActiveBadge({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      {count} Active
    </span>
  );
}

function QuietBadge() {
  return (
    <span className="flex items-center gap-1.5 bg-slate-700/40 border border-slate-600/25 text-slate-400 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      Quiet
    </span>
  );
}

function Avatar({ initials, size = "md", color = "emerald" }: { initials: string; size?: "sm" | "md"; color?: string }) {
  const sz = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const txt = size === "sm" ? "text-[11px]" : "text-[13px]";
  return (
    <div className={`${sz} rounded-full ${AVATAR_COLORS[color]} border flex items-center justify-center`}>
      <Mono className={`${txt} font-bold`}>{initials}</Mono>
    </div>
  );
}

function AvatarStack({ initials }: { initials: string[] }) {
  return (
    <div className="flex -space-x-1.5">
      {initials.map(i => (
        <div key={i} className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
          <Mono className="text-[7px] font-bold text-primary">{i}</Mono>
        </div>
      ))}
    </div>
  );
}

function Pill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <Mono className="text-[11px] font-bold text-primary">{label}</Mono>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1">
      <Mono className="text-[11px] font-bold text-primary">{value}</Mono>
      <Mono className="text-[11px] text-muted-foreground">{label}</Mono>
    </div>
  );
}

function Tag({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "warning" }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
      variant === "warning"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-background text-muted-foreground border-border"
    }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {children}
    </span>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative rounded-full border transition-colors shrink-0 ${
        on ? "bg-primary border-primary" : "bg-background border-border"
      }`}
      style={{ width: "44px", height: "24px" }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        className="absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow-sm"
        style={{ left: on ? "22px" : "2px" }}
      />
    </button>
  );
}

function GeoRow({ icon, accent, title, body }: { icon: string; accent: string; title: string; body: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`text-[13px] mt-0.5 shrink-0 ${accent}`}>{icon}</span>
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        <span className="text-foreground font-semibold">{title}</span>
        {" — "}
        {body}
      </p>
    </div>
  );
}
