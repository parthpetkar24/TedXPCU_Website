import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import heroBg from "./imports/1234.png";

import TitleReveal from "./components/TitleReveal";
import AboutPage from "./pages/AboutPage";
import TeamsPage from "./pages/TeamsPage";
import PixelCard from "./components/PixelCard";
import TiltedCard from "./components/TiltedCard";
import DepthCarousel from "./components/DepthCarousel";
import dummyTeamImg from "./imports/dummy_team.webp";

gsap.registerPlugin(ScrollTrigger);

function currentPath() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  let path = window.location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || "/";
  }
  if (!path.startsWith("/")) path = `/${path}`;
  return path.replace(/\/$/, "") || "/";
}

function navigateTo(path: string) {
  const base = import.meta.env.BASE_URL || "/";
  const url = path === "/" ? base : `${base.replace(/\/$/, "")}${path}`;
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function usePath() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const sync = () => setPath(currentPath());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return path;
}

// ─── Parallax Hook for Hero ───────────────────────────────────────────────────

function useParallax(speed = 0.3, baseScale = 0.85) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const scrollY = window.scrollY;
      ref.current.style.transform = `translateY(${scrollY * speed}px) scale(${baseScale})`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, baseScale]);

  return ref;
}

// ─── Decorative Graphics Component ────────────────────────────────────────────

function DecoCorner({ position, size = 40 }: { position: "tl" | "tr" | "bl" | "br"; size?: number }) {
  const styles: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0, transform: "scaleX(-1)" },
    bl: { bottom: 0, left: 0, transform: "scaleY(-1)" },
    br: { bottom: 0, right: 0, transform: "scale(-1)" },
  };
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 40 40"
      className="absolute pointer-events-none deco-breathe"
      style={styles[position]}
    >
      <line x1="0" y1="0" x2="0" y2="20" className="deco-line" />
      <line x1="0" y1="0" x2="20" y2="0" className="deco-line" />
      <circle cx="0" cy="0" r="2" fill="#ED2939" opacity="0.5" />
    </svg>
  );
}

function SectionDeco() {
  return (
    <div className="relative w-full flex justify-center py-4">
      <svg width="200" height="20" viewBox="0 0 200 20" className="overflow-visible">
        <line x1="0" y1="10" x2="80" y2="10" className="deco-line" opacity="0.3" />
        <circle cx="100" cy="10" r="3" fill="none" stroke="#ED2939" strokeWidth="1" opacity="0.5" />
        <circle cx="100" cy="10" r="1.5" fill="#ED2939" opacity="0.4" className="deco-breathe" />
        <line x1="120" y1="10" x2="200" y2="10" className="deco-line" opacity="0.3" />
      </svg>
    </div>
  );
}

// ─── Interaction Components ───────────────────────────────────────────────────

function TypewriterText({ text, delay = 0 }: { text: string, delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    timeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setIsDone(true);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <>
      {displayedText}
      <span className={`typewriter-cursor ${isDone ? 'done' : ''}`} style={{ opacity: isTyping || isDone ? undefined : 0 }} />
    </>
  );
}

function TiltCard({ children, locked = false }: { children: React.ReactNode, locked?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (locked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
    e.currentTarget.style.setProperty("--shine-x", `${(mouseX / width) * 100}%`);
    e.currentTarget.style.setProperty("--shine-y", `${(mouseY / height) * 100}%`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="tilt-card-wrapper w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="tilt-card relative w-full h-full"
        style={{ rotateX: locked ? 0 : rotateX, rotateY: locked ? 0 : rotateY }}
      >
        <div className="tilt-shine" />
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Home", "Theme", "About", "Teams", "Contact"];

const THEME = {
  code: " ",
  title: "आविर्भावः ",
  tagline: "Idea Manifested",
  description:
    " Avirbhava means the emergence or coming into existence of something meaningful. The theme represents how a simple idea, when supported by passion, determination, and action, can grow into something that creates a real impact. Every innovation, achievement, and change begins with an idea. Through this theme, TEDxPCU aims to showcase inspiring stories and perspectives that encourage people to turn their ideas into reality.",
};

const TEAM = [
  {
    name: "Aryan Raj",
    role: "Organiser",
    image: "/src/imports/Team/Aryan_Raj(2).png",
  },
  {
    name: "Shradha Solanke",
    role: "Co-Organiser",
    image: "/src/imports/Team/Shradha_Solanke (2).png",
  },
  {
    name: "Swapnil Adlinge",
    role: "Operations",
    image: "/src/imports/Team/Swapnil_Adlinge (2).png",
  },
  {
    name: "Amrisha Vashishtha",
    role: "Digital Platform",
    image: "/src/imports/Team/Amrisha_Vashishtha (2).png",
  },
  {
    name: "Shreya Singh",
    role: "EPM",
    image: "/src/imports/Team/Shreya_Singh (2).png",
  },
  {
    name: "Sahil Gore",
    role: "Production",
    image: "/src/imports/Team/Sahil_Gore (2).png",
  },
  {
    name: "Aditya Harpude",
    role: "Social Media",
    image: "/src/imports/Team/Aditya_Harpude (2).png",
  },
  {
    name: "Pratiksha Ghonshikar",
    role: "Graphic Design",
    image: "/src/imports/Team/Pratiksha_Ghonshikar (2).png",
  },
  {
    name: "Malhaar Jawalkar",
    role: "Hospitality",
    image: "/src/imports/Team/Malhaar_Jawalkar (2).png",
  },
  {
    name: "Ashwani Singh",
    role: "Logistics",
    image: "/src/imports/Team/Ashwani_Singh (2).png",
  },
  {
    name: "Sankalp Kale",
    role: "F&B",
    image: "/src/imports/Team/Sankalp_Kale (2).png",
  },
  {
    name: "Tanishka Borude",
    role: "Documentation",
    image: "/src/imports/Team/Tanishka_Borude (2).png",
  },
  {
    name: "Divyansh Gangurde",
    role: "Technical",
    image: "/src/imports/Team/Divyansh_Gangurde (2).png",
  },
  {
    name: "Abha Kurumbansi",
    role: "Registration",
    image: "/src/imports/Team/Abha_Kurumbansi (2).png",
  },
  {
    name: "Kashish Valecha",
    role: "Registration",
    image: "/src/imports/Team/Kashish_Valecha (2).png",
  },
  {
    name: "Shreya Rai",
    role: "Cultural",
    image: "/src/imports/Team/Shreya_Rai (2).png",
  },
  {
    name: "Vaishnavi Khandelwal",
    role: "Cultural",
    image: "/src/imports/Team/Vaishnavi_Khandelwal (2).png",
  },
  {
    name: "Kunal Shinde",
    role: "Promotions",
    image: "/src/imports/Team/Kunal_Shinde (2).png",
  },
  {
    name: "Viraj Mandekar",
    role: "Security",
    image: "/src/imports/Team/Viraj_Mandekar (2).png",
  },
  

];

const MENTORS = [
  {
    name: "Aditya Rasal",
    role: "Mentor",
    image: "/src/imports/Team/Aditya_Rasal (2).png",
  },
  {
    name: "Prathamesh Tupkari",
    role: "Mentor",
    image: "/src/imports/Team/Prathamesh (2).png",
  },
  {
    name: "Harshika Bodekar",
    role: "Mentor",
    image: "/src/imports/Team/Harshika (2).png",
  },
  {
    name: "Pranjali Pandit",
    role: "Mentor",
    image: "/src/imports/Team/Pranjali (2).png",
  },
  {
    name: "Raj Singh",
    role: "Mentor",
    image: "/src/imports/Team/Raj_Singh (2).png",
  },
  {
    name: "Raj Konde",
    role: "Mentor",
    image: "/src/imports/Team/Raj_Konde (2).png",
  },
];

const SPEAKERS = [
  {
    name: "Dr. Aisha Khan",
    topic: "The Future of AI",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format",
  },
  {
    name: "Marcus Reynolds",
    topic: "Sustainable Energy",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&auto=format",
  },
  {
    name: "Elena Rostova",
    topic: "Space Exploration",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&auto=format",
  },
  {
    name: "David Chen",
    topic: "Quantum Computing",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&auto=format",
  },
];

const EVENT_TIMELINE = [
  {
    time: "08:30 AM",
    title: "Doors Open & Registration",
    description:
      "Arrive early, collect your badge, and settle in. Meet fellow attendees over freshly brewed coffee and curated ambient sounds setting the tone for the day.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format",
    tag: "Welcome",
    icon: "🎟️",
  },
  {
    time: "09:15 AM",
    title: "Opening Ceremony",
    description:
      "The TEDxPCU organising team officially welcomes you. A powerful opening performance sets the emotional stage for a day of bold ideas and unexpected connections.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop&auto=format",
    tag: "Ceremony",
    icon: "🎙️",
  },
  {
    time: "10:00 AM",
    title: "Session I — Ignite",
    description:
      "The first speaker block. Three live talks exploring the catalytic power of a single idea. Thought-provoking, personal, and precise — each speaker gets 15 minutes to change your mind.",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop&auto=format",
    tag: "Talks",
    icon: "⚡",
  },
  {
    time: "11:30 AM",
    title: "TED Talk Screening",
    description:
      "A hand-picked TED Talk from the global archive, chosen to deepen the morning's theme. Watch together, reflect together.",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop&auto=format",
    tag: "Screening",
    icon: "🎬",
  },
  {
    time: "12:30 PM",
    title: "Networking Lunch",
    description:
      "A 60-minute curated lunch break with facilitated table conversations. Every table gets a conversation starter card — no small talk allowed.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
    tag: "Networking",
    icon: "🤝",
  },
  {
    time: "01:30 PM",
    title: "Session II — Fracture",
    description:
      "The afternoon's boldest block. Speakers who've lived through radical change share what broke and what emerged from the wreckage.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop&auto=format",
    tag: "Talks",
    icon: "💎",
  },
  {
    time: "03:30 PM",
    title: "Interactive Workshop",
    description:
      "A hands-on workshop led by our guest facilitator. Small groups, big ideas, zero hierarchy.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format",
    tag: "Workshop",
    icon: "🛠️",
  },
  {
    time: "05:00 PM",
    title: "Closing Keynote & Finale",
    description:
      "Our closing keynote speaker delivers a talk designed to leave a lasting imprint. Followed by a group reflection and the official TEDxPCU closing ritual.",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop&auto=format",
    tag: "Keynote",
    icon: "🌐",
  },
];

// ─── Magnetic Button Wrapper ───────────────────────────────────────────────────

function MagneticButton({ children, className = "", style = {}, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.2;
    const dy = (e.clientY - cy) * 0.25;
    const maxPull = 4;
    setOffset({
      x: Math.max(-maxPull, Math.min(maxPull, dx)),
      y: Math.max(-maxPull, Math.min(maxPull, dy)),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <button
      ref={ref}
      className={`magnetic-wrap ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ active, onNav }: { active: string; onNav: (s: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* ── Desktop + Mobile: Floating Pill ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{ paddingTop: scrolled ? "12px" : "18px", transition: "padding-top 0.5s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div
          className={`nav-pill pointer-events-auto flex items-center ${scrolled ? "scrolled" : ""}`}
          style={{
            padding: scrolled ? "6px 8px 6px 14px" : "8px 10px 8px 18px",
            maxWidth: scrolled ? "520px" : "600px",
            transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Logo */}
          <MagneticButton
            onClick={() => onNav("Home")}
            className="flex items-center flex-shrink-0"
            style={{ fontFamily: "Inter", textTransform: "uppercase" as const, letterSpacing: "-0.02em", background: "none", border: "none", cursor: "pointer" }}
          >
            <span style={{ color: "#EB0028", fontWeight: 700, fontSize: scrolled ? "14px" : "16px", transition: "font-size 0.5s cubic-bezier(0.16,1,0.3,1)" }}>TED</span>
            <sup style={{ color: "#EB0028", fontSize: scrolled ? "7px" : "8px", fontWeight: 700, verticalAlign: "baseline", position: "relative", top: "-0.5em", padding: "0 0.08em", transition: "all 0.5s" }}>x</sup>
            <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: scrolled ? "14px" : "16px", transition: "font-size 0.5s cubic-bezier(0.16,1,0.3,1)" }}>PCU</span>
          </MagneticButton>

          {/* Vertical divider */}
          <div className="hidden md:block flex-shrink-0 mx-3" style={{ width: "1px", height: "20px", background: "rgba(237,41,57,0.2)" }} />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5 relative">
            {NAV_LINKS.map((link) => (
              <MagneticButton
                key={link}
                onClick={() => onNav(link)}
                className="relative z-10"
                style={{
                  padding: scrolled ? "5px 14px" : "6px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: active === link ? "#F5F7FA" : "#8A96A4",
                  fontFamily: "Rajdhani",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "9999px",
                  transition: "all 0.3s ease, padding 0.5s cubic-bezier(0.16,1,0.3,1)",
                  letterSpacing: "0.03em",
                }}
              >
                {active === link && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="nav-pill-indicator absolute inset-0"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}
                <span className="relative z-10">{link}</span>
              </MagneticButton>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-3 p-1.5 flex-shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`block h-0.5 bg-white transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
              <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 bg-white transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
            </div>
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile Dropdown ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-40 md:hidden nav-pill-mobile"
            style={{
              top: "72px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "calc(100% - 40px)",
              maxWidth: "360px",
            }}
          >
            <div className="flex flex-col py-3 px-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link}
                  onClick={() => { onNav(link); setMenuOpen(false); }}
                  className="relative text-left text-sm font-medium py-3 px-4 transition-all duration-200"
                  style={{
                    color: active === link ? "#F5F7FA" : "#8A96A4",
                    fontFamily: "Rajdhani",
                    fontWeight: 600,
                    background: active === link ? "rgba(237,41,57,0.08)" : "transparent",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {active === link && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full" style={{ background: "#ED2939" }} />
                  )}
                  {link}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

// ─── Ambient Particles (tsParticles) ──────────────────────────────────────────

function AmbientParticles() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <ParticlesProvider init={particlesInit}>
      <Particles
        id="ambient-sparks"
        options={{
          fullScreen: { enable: true, zIndex: 0 },
          fpsLimit: 60,
          particles: {
            number: { value: isMobile ? 25 : 65, density: { enable: true, width: 1920, height: 1080 } },
            color: { value: ["#ED2939", "#FF4D5A", "#FFC000", "#FF6B6B"] },
            shape: { type: ["circle", "star"] },
            opacity: {
              value: { min: 0.1, max: isMobile ? 0.5 : 0.4 },
            },
            size: {
              value: { min: 0.5, max: isMobile ? 2 : 2.5 },
            },
            move: {
              enable: true,
              speed: { min: 0.2, max: 0.8 },
              direction: "none" as const,
              random: true,
              straight: false,
              outModes: { default: "out" as const },
            },
            links: {
              enable: true,
              distance: isMobile ? 100 : 140,
              color: "#ED2939",
              opacity: 0.25,
              width: isMobile ? 1.5 : 2.5,
            },
          },
          interactivity: {
            events: {
              onHover: { enable: !isMobile, mode: ["grab", "trail"] },
            },
            modes: {
              grab: { distance: 200, links: { opacity: 0.7 } },
              trail: { delay: 0.02, quantity: 6, particles: { color: { value: ["#FFC000", "#ED2939", "#FFFFFF"] }, size: { value: { min: 2, max: 5 } }, move: { speed: 4, outModes: "destroy" as const } } }
            },
          },
          detectRetina: true,
        }}
      />
    </ParticlesProvider>
  );
}

function HeroSection({ ready = true }: { ready?: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    gsap.set(titleRef.current, { opacity: 0, y: 70, scale: 0.92, filter: "blur(12px)" });
    gsap.set(subtitleRef.current, { opacity: 0, y: 30 });
    gsap.set(scrollIndRef.current, { opacity: 0, y: -15 });

    if (!ready) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 2.0,
        ease: "power3.out",
      })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
      }, "-=0.8")
      .to(scrollIndRef.current, {
        opacity: 0.5,
        y: 0,
        duration: 1.0,
        ease: "power2.out",
      }, "-=0.5");
    }, heroRef);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* PCU wireframe image background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="PCU Building"
          className="absolute inset-0 w-full h-full object-cover spooky-effect"
          style={{ 
            opacity: 0.6, 
            objectPosition: "center 60%", 
            WebkitMaskImage: "linear-gradient(to bottom, transparent 5%, black 25%, black 80%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 5%, black 25%, black 80%, transparent 100%)"
          }}
        />

        {/* Spooky Lightning Flash */}
        <div className="spooky-lightning" />

        {/* Red ambient glow */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 65%, rgba(237,41,57,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Film grain overlay */}
        <div className="grain-overlay" />

        {/* bottom fade into page */}
        <div className="absolute inset-0 hero-gradient" />

        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 25%, rgba(3,8,15,0.8) 100%)",
          }}
        />
      </div>

      {/* Decorative corner brackets */}
      <div className="absolute inset-8 z-10 pointer-events-none hidden md:block">
        <DecoCorner position="tl" size={48} />
        <DecoCorner position="tr" size={48} />
        <DecoCorner position="bl" size={48} />
        <DecoCorner position="br" size={48} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        <h1
          ref={titleRef}
          className="text-6xl sm:text-8xl md:text-[11rem] font-bold leading-none mb-6 red-glow"
          style={{ fontFamily: "Inter", letterSpacing: "-0.03em", opacity: 0 }}
        >
          <span style={{ color: "#EB0028", fontWeight: 700 }}>TED</span><sup style={{ color: "#EB0028", fontSize: "0.4em", fontWeight: 700, verticalAlign: "baseline", position: "relative", top: "-1em", padding: "0 0.08em" }}>x</sup><span style={{ color: "#FFFFFF", fontWeight: 400 }}>PCU</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-sm sm:text-lg md:text-xl tracking-widest h-8"
          style={{ color: "#AAB4C0", fontFamily: "Inter", fontWeight: 500, letterSpacing: "0.15em", opacity: 0 }}
        >
          <span style={{ color: "#EB0028" }}>x</span> = <TypewriterText text="independently organized TED event" delay={ready ? 900 : 999999} />
        </p>

        {/* Scroll indicator */}
        <div ref={scrollIndRef} className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ opacity: 0 }}>
          <div className="w-px h-16" style={{ background: "linear-gradient(180deg, #ED2939, transparent)" }} />
        </div>
      </div>
    </section>
  );
}

// ─── Theme Section ─────────────────────────────────────────────────────────────

function ThemeSection() {
  const [locked, setLocked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".theme-label", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".theme-label", start: "top 88%" },
      });
      gsap.from(".theme-heading", {
        opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".theme-heading", start: "top 88%" },
      });
      gsap.from(".theme-subtitle", {
        opacity: 0, y: 30, duration: 0.7, delay: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".theme-subtitle", start: "top 88%" },
      });
      gsap.from(".theme-card", {
        opacity: 0, scale: 0.92, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".theme-card", start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    if (!locked) {
      setLocked(true);
      setTimeout(() => setExpanded(true), 400);
    } else {
      setExpanded((e) => !e);
    }
  };

  return (
    <section ref={sectionRef} id="theme" className="py-28 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="theme-heading text-5xl md:text-6xl font-bold mt-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>Our Theme</h2>
        <p className="theme-subtitle mt-4 max-w-lg mx-auto" style={{ color: "#8A96A4", fontFamily: "Rajdhani" }}>Click to lock on and reveal the full story.</p>
      </div>

      {/* Single theme card */}
      <TiltCard locked={locked}>
        <div
          className="theme-card relative cursor-pointer transition-all duration-700 w-full h-full"
          onClick={handleClick}
          style={{
            border: locked ? "1px solid rgba(237,41,57,0.5)" : "1px solid rgba(255,255,255,0.25)",
            background: expanded ? "rgba(5,12,22,0.98)" : "rgba(5,12,22,0.7)",
            borderRadius: "4px",
            backdropFilter: "blur(12px)",
            transform: expanded ? "scale(1.01)" : "scale(1)",
            boxShadow: locked ? "0 0 40px rgba(237,41,57,0.12)" : "none",
          }}
        >
          {/* Hover reticle */}
          {!locked && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="w-16 h-16 border-2 rounded-full" style={{ borderColor: "#ED2939", animation: "pulse-ring 1.5s ease-in-out infinite" }} />
              <div className="absolute w-8 h-8 border rounded-full" style={{ borderColor: "#ED2939" }} />
              <div className="absolute w-2 h-2 rounded-full" style={{ background: "#ED2939" }} />
              <div className="absolute w-24 h-px" style={{ background: "rgba(237,41,57,0.5)" }} />
              <div className="absolute h-24 w-px" style={{ background: "rgba(237,41,57,0.5)" }} />
            </div>
          )}

        {/* Corner brackets when locked */}
        {locked && (
          <>
            <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: "#ED2939" }} />
            <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: "#ED2939" }} />
            <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: "#ED2939" }} />
            <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: "#ED2939" }} />
          </>
        )}

        <div className="p-10 md:p-14">
          {/* Theme logo */}
          <div className="mb-8 flex justify-center">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="36" cy="36" r="34" stroke="#ED2939" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
              <circle cx="36" cy="36" r="26" stroke="#ED2939" strokeWidth="1" opacity="0.3" />
              <circle cx="36" cy="36" r="18" fill="rgba(237,41,57,0.08)" stroke="#ED2939" strokeWidth="1.5" />
              <line x1="25" y1="25" x2="47" y2="47" stroke="#ED2939" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="47" y1="25" x2="25" y2="47" stroke="#ED2939" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="36" y1="2" x2="36" y2="8" stroke="#ED2939" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="36" y1="64" x2="36" y2="70" stroke="#ED2939" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="36" x2="8" y2="36" stroke="#ED2939" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="64" y1="36" x2="70" y2="36" stroke="#ED2939" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mb-6">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>Theme {THEME.code}</span>
            <h3 className="text-5xl md:text-7xl font-bold mt-2" style={{ fontFamily: "'Rozha One', serif", color: "#F5F7FA", letterSpacing: "0.02em", textShadow: "0 0 25px rgba(237,41,57,0.3)" }}>{THEME.title}</h3>
          </div>

          <p className="text-lg font-medium mb-4" style={{ color: "#ED2939", fontFamily: "Oswald", textTransform: "uppercase", letterSpacing: "0.1em" }}>"{THEME.tagline}"</p>

          {!locked && (
            <p className="text-sm" style={{ color: "#8A96A4", fontFamily: "Rajdhani" }}>Click to reveal →</p>
          )}

          {locked && !expanded && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ED2939" }} />
              <span className="text-xs tracking-widest" style={{ color: "#ED2939", fontFamily: "Rajdhani", fontWeight: 700 }}>TARGET LOCKED — EXPANDING...</span>
            </div>
          )}

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="section-divider my-6 opacity-30" />
                <p className="text-base leading-relaxed text-lg" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>{THEME.description}</p>
                <div className="mt-8 flex items-center gap-2">
                  <span className="text-xs tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani", fontWeight: 700 }}>◆ Target Acquired</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </TiltCard>
    </section>
  );
}

// ─── About Section ─────────────────────────────────────────────────────────────

function AboutSection() {
  const [rotation, setRotation] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setRotation((r) => r + 0.3), 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".about-label", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".about-label", start: "top 88%" },
      });
      gsap.from(".about-heading", {
        opacity: 0, x: -50, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".about-heading", start: "top 88%" },
      });
      gsap.from(".about-text", {
        opacity: 0, x: -40, duration: 0.8, delay: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ".about-text", start: "top 88%" },
      });
      gsap.from(".about-stat", {
        opacity: 0, y: 40, duration: 0.7, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".about-stat", start: "top 90%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const facts = [
    { label: "Events Held", value: "49,000+" },
    { label: "Countries", value: "180" },
    { label: "Events Annually", value: "4000+" },
    { label: "Years Running", value: "15+" },
  ];

  return (
    <section ref={sectionRef} id="about" className="py-28 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div className="order-2 lg:order-1">
          <span className="about-label text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>◆ About Us</span>
          <h2 className="about-heading text-5xl md:text-6xl font-bold mt-4 mb-6" style={{ fontFamily: "Inter", color: "#F5F7FA", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
            What is <span style={{ color: "#EB0028", fontWeight: 700 }}>TED</span><sup style={{ color: "#EB0028", fontSize: "0.45em", fontWeight: 700, verticalAlign: "baseline", position: "relative", top: "-1em", padding: "0 0.08em" }}>x</sup>
          </h2>
          <p className="about-text text-base leading-relaxed mb-6" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
            In the spirit of discovering and spreading ideas, TEDx is a program of local, self-organized events that bring people together to share a TED-like experience. At a TEDx event, TED Talks video and live speakers combine to spark deep discussion and connection. These local, self-organized events are branded TEDx, where x = independently organized TED event. The TED Conference provides general guidance for the TEDx program, but individual TEDx events are self-organized. (Subject to certain rules and regulations.)
          </p>
          <div className="grid grid-cols-2 gap-6">
            {facts.map((f) => (
              <div key={f.label} className="about-stat p-4 card-glass" style={{ borderRadius: "4px" }}>
                <div className="text-3xl font-bold" style={{ fontFamily: "Oswald", color: "#ED2939" }}>{f.value}</div>
                <div className="text-sm mt-1" style={{ fontFamily: "Rajdhani", color: "#8A96A4" }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Black hole visual */}
        {/* (data-reveal on the text side only to preserve the animated orbiting visual) */}
        <div className="relative flex items-center justify-center order-1 lg:order-2" style={{ height: "clamp(280px, 50vw, 480px)" }}>
          <div className="absolute rounded-full" style={{ width: "min(420px, 80vw)", height: "min(420px, 80vw)", background: "radial-gradient(ellipse, rgba(237,41,57,0.03) 0%, transparent 70%)" }} />
          {[380, 320, 260, 200].map((size, i) => {
            const mobileSize = Math.min(size, size * 0.65);
            return (
            <div key={size} className="absolute rounded-full" style={{
              width: `min(${size}px, ${mobileSize / 4 + 15}vw)`, height: `min(${size}px, ${mobileSize / 4 + 15}vw)`,
              border: `1px solid rgba(237,41,57,${0.08 + i * 0.04})`,
              transform: `rotate(${rotation * (1 + i * 0.2)}deg) scaleY(0.3)`,
              boxShadow: i === 3 ? "0 0 20px rgba(237,41,57,0.2)" : "none",
            }} />
          )})}
          <div className="absolute rounded-full" style={{
            width: "130px", height: "130px",
            background: "radial-gradient(circle, #03080F 40%, rgba(237,41,57,0.6) 70%, transparent 100%)",
            boxShadow: "0 0 60px rgba(237,41,57,0.5), inset 0 0 30px rgba(237,41,57,0.2)",
          }} />
          <div className="absolute rounded-full" style={{ width: "60px", height: "60px", background: "#03080F", boxShadow: "0 0 30px rgba(237,41,57,0.8)" }}>
            <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(237,41,57,0.4), transparent)" }} />
          </div>
          {facts.map((fact, i) => {
            const angle = (rotation * 0.5 + i * 90) * (Math.PI / 180);
            const orbitRadius = typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 170;
            const x = Math.cos(angle) * orbitRadius;
            const y = Math.sin(angle) * orbitRadius * 0.35;
            return (
              <div key={fact.label} className="absolute text-center" style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform 0.016s linear" }}>
                <div className="text-lg sm:text-xl font-bold" style={{ fontFamily: "Oswald", color: "#ED2939" }}>{fact.value}</div>
                <div className="text-[10px] sm:text-xs tracking-wide" style={{ fontFamily: "Rajdhani", color: "#AAB4C0" }}>{fact.label}</div>
              </div>
            );
          })}
          <div className="absolute text-center z-10" style={{ pointerEvents: "none" }}>
            <span className="text-xs font-bold tracking-widest" style={{ fontFamily: "Oswald", color: "rgba(237,41,57,0.6)" }}>
              TED<span style={{ color: "#ED2939" }}>x</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Speakers Section ────────────────────────────────────────────────────────
function SpeakersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".speakers-label", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".speakers-label", start: "top 88%" },
      });
      gsap.from(".speakers-heading", {
        opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".speakers-heading", start: "top 88%" },
      });
      gsap.from(".speaker-card-anim", {
        opacity: 0, y: 40, duration: 0.7, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ".speaker-card-anim", start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="speakers" className="py-28 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="speakers-label text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>◆ Lineup</span>
        <h2 className="speakers-heading text-5xl md:text-6xl font-bold mt-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>
          Our Speakers
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 justify-items-center">
        {SPEAKERS.map((speaker, idx) => (
          <div key={idx} className="speaker-card-anim">
            <PixelCard variant="imperial" className="bg-black">
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none p-4 text-center">
                <h3 className="text-2xl font-bold" style={{ fontFamily: "Oswald", color: "#FFFFFF", textTransform: "uppercase" }}>To be Announced</h3>
              </div>
            </PixelCard>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Team Section ─────────────────────────────────────────────────────────────
function TeamSection({ onViewAll }: { onViewAll: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".team-label", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".team-label", start: "top 88%" },
      });
      gsap.from(".team-heading", {
        opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".team-heading", start: "top 88%" },
      });
      gsap.from(".team-cards-row", {
        opacity: 0, y: 50, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".team-cards-row", start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="team" className="py-28 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-16">
        <span className="team-label text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>◆ Core Team</span>
        <h2 className="team-heading text-5xl md:text-6xl font-bold mt-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>
          Behind TEDxPCU
        </h2>
      </div>

      {/* Two TiltedCards side by side */}
      <div className="team-cards-row flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 mb-16">
        <TiltedCard
          imageSrc={TEAM[0].image}
          altText={TEAM[0].name}
          captionText={`${TEAM[0].name} — ${TEAM[0].role}`}
          containerHeight="300px"
          containerWidth="300px"
          imageHeight="300px"
          imageWidth="300px"
          rotateAmplitude={12}
          scaleOnHover={1.05}
          showMobileWarning={false}
          showTooltip
          displayOverlayContent
          overlayContent={
            <p className="tilted-card-demo-text">
              {TEAM[0].name} — {TEAM[0].role}
            </p>
          }
        />
        <TiltedCard
          imageSrc={TEAM[1].image}
          altText={TEAM[1].name}
          captionText={`${TEAM[1].name} — ${TEAM[1].role}`}
          containerHeight="300px"
          containerWidth="300px"
          imageHeight="300px"
          imageWidth="300px"
          rotateAmplitude={12}
          scaleOnHover={1.05}
          showMobileWarning={false}
          showTooltip
          displayOverlayContent
          overlayContent={
            <p className="tilted-card-demo-text">
              {TEAM[1].name} — {TEAM[1].role}
            </p>
          }
        />
      </div>

      {/* View All Members Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onViewAll}
          className="view-all-members-btn px-10 py-4 text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:scale-[1.04]"
          style={{
            background: "#ED2939",
            color: "#F5F7FA",
            fontFamily: "Oswald",
            borderRadius: "4px",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 0 24px rgba(237,41,57,0.35), 0 4px 16px rgba(237,41,57,0.2)",
            letterSpacing: "0.12em",
          }}
        >
          View All Members →
        </button>
      </div>
    </section>
  );
}

// ─── Mentors Section ──────────────────────────────────────────────────────────
function MentorsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".mentors-label", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".mentors-label", start: "top 88%" },
      });
      gsap.from(".mentors-heading", {
        opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".mentors-heading", start: "top 88%" },
      });
      gsap.from(".mentors-carousel-wrap", {
        opacity: 0, y: 50, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".mentors-carousel-wrap", start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const mentorCarouselItems = MENTORS.map(t => ({
    image: t.image,
    alt: t.name,
    title: t.name,
    designation: t.role
  }));

  return (
    <section ref={sectionRef} id="mentors" className="py-28 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-16">
        <span className="mentors-label text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>◆ Guidance</span>
        <h2 className="mentors-heading text-5xl md:text-6xl font-bold mt-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>
          Mentors
        </h2>
        <p className="mt-4 max-w-lg mx-auto" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
          The guiding forces behind TEDxPCU — mentors who inspire and elevate every idea.
        </p>
      </div>

      <div className="mentors-carousel-wrap" style={{ height: '450px', position: 'relative', maxWidth: '100vw' }}>
        <DepthCarousel
          items={mentorCarouselItems}
          depth={220}
          spread={90}
          tilt={22}
          tiltDirection="right"
          perspective={1400}
          visibleCards={3}
          falloff={0.2}
          blur={6}
          autoplay={true}
          loop={true}
          cardWidth={280}
          cardHeight={360}
          radius={18}
          tint="rgba(237,41,57, 0.15)"
          duration={700}
          ease="power3.out"
          autoplayDelay={3200}
          showControls={true}
          showIndicators={true}
        />
      </div>
    </section>
  );
}

// ─── Event Timeline ────────────────────────────────────────────────────────────

function TimelineMarker({ active, icon }: { active: boolean; icon: string }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-500" style={{
        background: active ? "rgba(237,41,57,0.15)" : "rgba(5,12,22,0.9)",
        border: active ? "2px solid #ED2939" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: active ? "0 0 24px rgba(237,41,57,0.4)" : "none",
      }}>
        {icon}
      </div>
    </div>
  );
}

function TimelineConnector({ active }: { active: boolean }) {
  return (
    <div className="w-0.5 transition-all duration-700" style={{
      height: "60px",
      background: active ? "linear-gradient(180deg, #ED2939, rgba(237,41,57,0.2))" : "rgba(255,255,255,0.06)",
    }} />
  );
}

function TimelineProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-3 justify-center mb-12">
      <span className="text-xs tracking-widest" style={{ color: "#8A96A4", fontFamily: "Rajdhani", fontWeight: 600 }}>{String(current + 1).padStart(2, "0")}</span>
      <div className="relative h-px flex-1 max-w-xs" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="absolute left-0 top-0 h-full transition-all duration-500" style={{
          width: `${((current + 1) / total) * 100}%`,
          background: "linear-gradient(90deg, #ED2939, rgba(237,41,57,0.4))",
        }} />
      </div>
      <span className="text-xs tracking-widest" style={{ color: "#8A96A4", fontFamily: "Rajdhani", fontWeight: 600 }}>{String(total).padStart(2, "0")}</span>
    </div>
  );
}

function ScrollTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = itemRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.55 }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!timelineSectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".tl-label", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".tl-label", start: "top 88%" },
      });
      gsap.from(".tl-heading", {
        opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".tl-heading", start: "top 88%" },
      });
      gsap.from(".tl-subtitle", {
        opacity: 0, y: 30, duration: 0.7, delay: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".tl-subtitle", start: "top 88%" },
      });
    }, timelineSectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={timelineSectionRef} id="timeline" className="py-28 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="tl-label text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>◆ Event Day</span>
        <h2 className="tl-heading text-5xl md:text-6xl font-bold mt-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>How It Unfolds</h2>
        <p className="tl-subtitle mt-4 max-w-lg mx-auto" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
          A full-day journey from first coffee to closing keynote — every moment crafted with intention.
        </p>
      </div>

      <TimelineProgress total={EVENT_TIMELINE.length} current={activeIndex} />

      <div className="relative flex flex-col">
        {EVENT_TIMELINE.map((item, i) => {
          const isLeft = i % 2 === 0;
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;

          return (
            <div key={item.title}>
              <div ref={(el) => { itemRefs.current[i] = el; }}
                className={`flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 w-full transition-opacity duration-500 ${isPast ? "opacity-50" : ""}`}>
                {/* Left */}
                <div className="flex-1 flex justify-end">
                  {isLeft ? (
                    <div className={`flex-1 text-left md:text-right pr-0 md:pr-10 transition-all duration-700 ${isActive ? "opacity-100 translate-y-0" : "opacity-40 translate-y-2"}`}>
                      <div className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase mb-2" style={{
                        background: isActive ? "rgba(237,41,57,0.12)" : "rgba(255,255,255,0.04)",
                        color: isActive ? "#ED2939" : "#AAB4C0",
                        border: isActive ? "1px solid rgba(237,41,57,0.3)" : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "2px", fontFamily: "Rajdhani",
                      }}>{item.tag}</div>
                      <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>{item.time}</div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>{item.title}</h3>
                      <p className="text-sm leading-relaxed ml-0 md:ml-auto" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans", maxWidth: "360px" }}>{item.description}</p>
                    </div>
                  ) : (
                    <div className={`hidden lg:block flex-1 pl-0 pr-10 transition-all duration-700 ${isActive ? "opacity-100 scale-100" : "opacity-20 scale-95"}`}>
                      <div className="overflow-hidden" style={{ borderRadius: "4px", border: isActive ? "1px solid rgba(237,41,57,0.25)" : "1px solid rgba(255,255,255,0.04)", maxHeight: "180px" }}>
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" style={{ maxHeight: "180px" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Center - hide on mobile */}
                <TimelineMarker active={isActive || isPast} icon={item.icon} />

                {/* Right */}
                <div className="flex-1 flex justify-start">
                  {isLeft ? (
                    <div className={`hidden lg:block flex-1 pl-10 transition-all duration-700 ${isActive ? "opacity-100 scale-100" : "opacity-20 scale-95"}`}>
                      <div className="overflow-hidden" style={{ borderRadius: "4px", border: isActive ? "1px solid rgba(237,41,57,0.25)" : "1px solid rgba(255,255,255,0.04)", maxHeight: "180px" }}>
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" style={{ maxHeight: "180px" }} />
                      </div>
                    </div>
                  ) : (
                    <div className={`flex-1 text-left pl-0 md:pl-10 transition-all duration-700 ${isActive ? "opacity-100 translate-y-0" : "opacity-40 translate-y-2"}`}>
                      <div className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase mb-2" style={{
                        background: isActive ? "rgba(237,41,57,0.12)" : "rgba(255,255,255,0.04)",
                        color: isActive ? "#ED2939" : "#AAB4C0",
                        border: isActive ? "1px solid rgba(237,41,57,0.3)" : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "2px", fontFamily: "Rajdhani",
                      }}>{item.tag}</div>
                      <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>{item.time}</div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>{item.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans", maxWidth: "360px" }}>{item.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {i < EVENT_TIMELINE.length - 1 && (
                <div className="flex justify-center">
                  <TimelineConnector active={i < activeIndex} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Contact Section ───────────────────────────────────────────────────────────

const CONTACTS = [
  {
    role: "Organiser",
    name: "Aryan Raj",
    phone: "+91 8252900353",
  },
  {
    role: "Co-Organiser",
    name: "Shradha Solanke",
    phone: "+91 9326843844",
  },
  {
    role: "Operations",
    name: "Swapnil Adlinge",
    phone: "+91 7887472023",
  },
];

function ContactCard({ contact, index }: { contact: typeof CONTACTS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative group cursor-default transition-all duration-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${index * 150}ms`,
        animation: "fadeInUp 0.7s ease-out both",
      }}
    >
      {/* Animated border glow */}
      <div
        className="absolute inset-0 rounded-sm transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: "linear-gradient(135deg, rgba(237,41,57,0.15), transparent, rgba(237,41,57,0.08))",
          boxShadow: "0 0 40px rgba(237,41,57,0.15)",
        }}
      />

      <div
        className="relative overflow-hidden transition-all duration-500"
        style={{
          border: hovered ? "1px solid rgba(237,41,57,0.4)" : "1px solid rgba(255,255,255,0.06)",
          borderRadius: "4px",
          background: "rgba(5,12,22,0.9)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px transition-all duration-500"
          style={{ background: hovered ? "#ED2939" : "rgba(237,41,57,0.2)" }}
        />

        {/* Scan line animation on hover */}
        {hovered && (
          <div
            className="absolute left-0 right-0 h-16 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(237,41,57,0.04), transparent)",
              animation: "scanline 1.4s ease-in-out infinite",
              top: 0,
            }}
          />
        )}

        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t border-l transition-all duration-300"
          style={{ borderColor: hovered ? "#ED2939" : "rgba(255,255,255,0.1)" }} />
        <div className="absolute top-3 right-3 w-4 h-4 border-t border-r transition-all duration-300"
          style={{ borderColor: hovered ? "#ED2939" : "rgba(255,255,255,0.1)" }} />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l transition-all duration-300"
          style={{ borderColor: hovered ? "#ED2939" : "rgba(255,255,255,0.1)" }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r transition-all duration-300"
          style={{ borderColor: hovered ? "#ED2939" : "rgba(255,255,255,0.1)" }} />

        <div className="p-8 pt-7">
          {/* Role badge */}
          <div className="mb-6">
            <span
              className="text-xs font-semibold tracking-widest uppercase px-3 py-1"
              style={{
                color: "#ED2939", fontFamily: "Rajdhani", fontWeight: 700,
                background: "rgba(237,41,57,0.08)",
                border: "1px solid rgba(237,41,57,0.2)",
                borderRadius: "2px",
              }}
            >
              {contact.role}
            </span>
          </div>

          {/* Name */}
          <div className="mb-7">
            <h3 className="text-xl font-bold" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>{contact.name}</h3>
          </div>

          {/* Contact lines */}
          <div className="flex flex-col gap-4">
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ED2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>, label: "Phone", value: contact.phone },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0 text-sm transition-all duration-300"
                  style={{
                    background: hovered ? "rgba(237,41,57,0.12)" : "rgba(255,255,255,0.04)",
                    border: hovered ? "1px solid rgba(237,41,57,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "2px",
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div className="text-xs tracking-widest uppercase mb-0.5" style={{ color: "#ED2939", fontFamily: "Rajdhani", fontWeight: 700, fontSize: "10px" }}>{label}</div>
                  <div className="text-sm" style={{ color: "#F5F7FA", fontFamily: "IBM Plex Sans" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".contact-label", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-label", start: "top 90%" },
      });
      gsap.from(".contact-heading", {
        opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-heading", start: "top 90%" },
      });
      gsap.from(".contact-subtitle", {
        opacity: 0, y: 30, duration: 0.7, delay: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-subtitle", start: "top 90%" },
      });
      gsap.from(".contact-info", {
        opacity: 0, scale: 0.95, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-info", start: "top 90%" },
      });
      gsap.from(".contact-cards > div", {
        opacity: 0, y: 40, duration: 0.7, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-cards", start: "top 90%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    let frame = 0;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Web of nodes connecting the 3 contacts
    const nodes = [
      { x: 0.2, y: 0.5 }, { x: 0.5, y: 0.3 }, { x: 0.8, y: 0.5 },
      { x: 0.35, y: 0.75 }, { x: 0.65, y: 0.75 },
    ];

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      frame++;
      ctx.clearRect(0, 0, W, H);

      const pulse = 0.3 + Math.sin(frame * 0.02) * 0.15;

      // Draw connecting lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          ctx.beginPath();
          ctx.moveTo(a.x * W, a.y * H);
          ctx.lineTo(b.x * W, b.y * H);
          ctx.strokeStyle = `rgba(237,41,57,${pulse * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Travelling dots along lines
      nodes.forEach((a, i) => {
        const b = nodes[(i + 1) % nodes.length];
        const t = ((frame * 0.008 + i * 0.2) % 1);
        const dx = b.x * W - a.x * W;
        const dy = b.y * H - a.y * H;
        ctx.beginPath();
        ctx.arc(a.x * W + dx * t, a.y * H + dy * t, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(237,41,57,${0.6 + Math.sin(frame * 0.05 + i) * 0.3})`;
        ctx.fill();
      });

      // Node dots
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x * W, n.y * H, 3 + Math.sin(frame * 0.04) * 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(237,41,57,${0.4 + pulse * 0.3})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="py-28 px-6 relative overflow-hidden">
      {/* Animated network canvas bg */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="contact-label text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>◆ Reach Us</span>
          <h2 className="contact-heading text-5xl md:text-6xl font-bold mt-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>Contact Us</h2>
          <p className="contact-subtitle mt-4 max-w-lg mx-auto" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
            Every great idea begins with a conversation. Reach out directly to our team.
          </p>
        </div>

        {/* General info bar */}
        <div
          className="contact-info flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-8 mb-14 p-4 sm:p-6"
          style={{ background: "rgba(5,12,22,0.7)", border: "1px solid rgba(237,41,57,0.15)", borderRadius: "4px", backdropFilter: "blur(12px)" }}
        >
          {[
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ED2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>, label: "Location", value: "Auditorium, 3rd Floor, Admin, PCU Campus, Pune, Maharashtra" },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ED2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>, label: "General Enquiries", value: "tedxpcu@gmail.com" },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ED2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>, label: "Social", value: "@tedxpcu" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <div>
                <div className="text-xs tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani", fontWeight: 700, fontSize: "10px" }}>{label}</div>
                <div className="text-sm font-medium" style={{ color: "#F5F7FA", fontFamily: "IBM Plex Sans" }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact cards */}
        <div className="contact-cards grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONTACTS.map((contact, i) => (
            <ContactCard key={contact.name} contact={contact} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Sponsors Section ──────────────────────────────────────────────────────────

function SponsorsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".sponsors-label", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".sponsors-label", start: "top 88%" },
      });
      gsap.from(".sponsors-heading", {
        opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".sponsors-heading", start: "top 88%" },
      });
      gsap.from(".sponsor-card", {
        opacity: 0, y: 40, duration: 0.7, stagger: 0.2, ease: "power3.out",
        scrollTrigger: { trigger: ".sponsor-card", start: "top 90%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="sponsors" className="py-28 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="sponsors-label text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>◆ Our Partners</span>
        <h2 className="sponsors-heading text-5xl md:text-6xl font-bold mt-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>
          Sponsors
        </h2>
      </div>

      <div className="flex items-center justify-center">
        <img
          src="/src/imports/Propel_Logo.png"
          alt="Propel sponsor"
          className="sponsor-card max-w-full object-contain"
          style={{ width: "320px", height: "220px" }}
        />
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer({ onNav }: { onNav: (s: string) => void }) {
  return (
    <footer className="py-16 px-6 mt-12" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="text-2xl font-bold mb-4" style={{ fontFamily: "Inter", letterSpacing: "-0.02em" }}>
              <span style={{ color: "#EB0028", fontWeight: 700 }}>TED</span><sup style={{ color: "#EB0028", fontSize: "0.5em", fontWeight: 700, verticalAlign: "baseline", position: "relative", top: "-1em", padding: "0 0.1em" }}>x</sup><span style={{ color: "#FFFFFF", fontWeight: 700 }}>PCU</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
              An independently organized TED event bringing ideas worth spreading to PCU and beyond.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#ED2939", fontFamily: "Rajdhani", fontWeight: 700 }}>Navigation</div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.filter((l) => l !== "Apply Now").map((link) => (
                <button key={link} onClick={() => onNav(link)}
                  className="text-left text-sm transition-colors duration-200 hover:text-red-400"
                  style={{ color: "#8A96A4", fontFamily: "Rajdhani" }}>
                  {link}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#EB0028", fontFamily: "Rajdhani", fontWeight: 700 }}>Connect</div>
            {[
              { name: "Instagram", url: "https://www.instagram.com/tedxpcu" },
              { name: "LinkedIn", url: "https://www.linkedin.com/showcase/tedxpcu2026/" },
              { name: "YouTube", url: "https://www.youtube.com/@tedxpcu" },
            ].map(({ name, url }) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                className="block text-sm mb-3 transition-colors duration-200 hover:text-red-400"
                style={{ color: "#8A96A4", fontFamily: "Rajdhani", textDecoration: "none" }}>
                {name}
              </a>
            ))}
          </div>
        </div>
        <div className="section-divider mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs" style={{ color: "rgba(237,41,57,0.6)", fontFamily: "IBM Plex Sans", fontWeight: 600 }}>This independent TEDx event is operated under license from TED.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Apply Now Page ─────────────────────────────────────────────────────────────

function ApplyPage({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", college: "", why: "", idea: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow-pulse"
            style={{ background: "rgba(237,41,57,0.15)", border: "2px solid #ED2939" }}>
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>Application Received!</h2>
          <p className="mb-8" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
            Thank you for applying to TEDxPCU. Our team will review your application and get back to you within 7 days.
          </p>
          <button onClick={onBack} className="px-8 py-3 text-sm font-semibold tracking-widest uppercase"
            style={{ background: "#ED2939", color: "#F5F7FA", fontFamily: "Oswald", borderRadius: "2px", textTransform: "uppercase" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-sm mb-8 flex items-center gap-2 transition-colors hover:text-red-400"
          style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
          ← Back to Home
        </button>
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani", fontWeight: 700 }}>◆ Join The Movement</span>
        <h1 className="text-5xl font-bold mt-4 mb-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>Apply Now</h1>
        <p className="mb-10" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
          Applications are reviewed by our curation team. Seats are limited. Tell us your story.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {[
            { field: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
            { field: "email", label: "Email", type: "email", placeholder: "you@email.com" },
            { field: "phone", label: "Phone", type: "tel", placeholder: "+91 XXXXX XXXXX" },
            { field: "college", label: "College / Institution", type: "text", placeholder: "Where do you study/work?" },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#8A96A4", fontFamily: "Rajdhani", fontWeight: 700 }}>{label}</label>
              <input type={type} placeholder={placeholder} value={form[field as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })} required
                className="w-full px-4 py-3 bg-transparent outline-none"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#F5F7FA", fontFamily: "IBM Plex Sans", borderRadius: "2px" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(237,41,57,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
            </div>
          ))}
          {[
            { field: "why", label: "Why do you want to attend TEDxPCU?", placeholder: "Tell us what draws you to this experience..." },
            { field: "idea", label: "What idea excites you most right now?", placeholder: "An idea worth sharing..." },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#8A96A4", fontFamily: "Rajdhani", fontWeight: 700 }}>{label}</label>
              <textarea rows={4} placeholder={placeholder} value={form[field as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })} required
                className="w-full px-4 py-3 bg-transparent outline-none resize-none"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#F5F7FA", fontFamily: "IBM Plex Sans", borderRadius: "2px" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(237,41,57,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
            </div>
          ))}
          <button type="submit" className="px-10 py-4 text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] animate-glow-pulse mt-2"
            style={{ background: "#ED2939", color: "#F5F7FA", fontFamily: "Oswald", borderRadius: "2px", textTransform: "uppercase" }}>
            Submit Application →
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Event Date Panel ────────────────────────────────────────────────────────────

function EventDatePanel() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 40 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto event-date-panel">
      <motion.div
        className="event-date-card p-12 md:p-20 flex flex-col items-center justify-center text-center cursor-default"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "Oswald", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.02em" }}>
          TED<sup style={{ fontSize: "0.5em" }}>x</sup>PCU
        </h2>
        <div className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 red-glow" style={{ fontFamily: "Inter", color: "#F5F7FA" }}>
          09.10.2026
        </div>
        <p className="text-lg md:text-xl font-medium tracking-widest" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Rajdhani", textTransform: "uppercase" }}>
          Save The Date
        </p>
      </motion.div>
    </section>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const path = usePath();
  const isAboutPage = path === "/about";
  const isTeamsPage = path === "/teams";
  const activePage = isAboutPage ? "About" : isTeamsPage ? "Teams" : "Home";
  const [introDone, setIntroDone] = useState(() => currentPath() === "/about" || currentPath() === "/teams");
  const lenisRef = useRef<Lenis | null>(null);

  // ── Lenis smooth scroll + GSAP ScrollTrigger sync ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.stop();
    lenisRef.current = lenis;

    // Sync Lenis scroll position with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time: number) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time: number) => lenis.raf(time * 1000));
    };
  }, []);

  useEffect(() => {
    if (!introDone) return;
    lenisRef.current?.start();
  }, [introDone]);

  useEffect(() => {
    if (isAboutPage || isTeamsPage) setIntroDone(true);
  }, [isAboutPage, isTeamsPage]);

  const handleNav = (page: string) => {
    if (page === "Teams") {
      navigateTo("/teams");
      window.scrollTo(0, 0);
      lenisRef.current?.scrollTo(0, { immediate: true });
      return;
    }

    if (page === "About") {
      navigateTo("/about");
      lenisRef.current?.scrollTo(0, { duration: 0.8 });
      return;
    }

    const scrollHomeTarget = () => {
      if (page === "Home") {
        lenisRef.current?.scrollTo(0, { duration: 1.2 });
        return;
      }
      const idMap: Record<string, string> = {
        Theme: "theme",
        Contact: "contact",
      };
      const target = document.getElementById(idMap[page]);
      if (target) lenisRef.current?.scrollTo(target, { offset: -20, duration: 1.4 });
    };

    if (isAboutPage || isTeamsPage) {
      navigateTo("/");
      window.setTimeout(scrollHomeTarget, 60);
      return;
    }

    scrollHomeTarget();
  };

  const handleGoToTeams = () => {
    navigateTo("/teams");
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true });
  };

  const handleBackFromTeams = () => {
    navigateTo("/");
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true });
  };

  return (
    <div style={{ background: "#03080F", minHeight: "100vh", position: "relative" }}>
      {!isAboutPage && !isTeamsPage && !introDone && (
        <TitleReveal
          logo="TEDXPCU"
          onComplete={() => setIntroDone(true)}
        />
      )}
      <AmbientParticles />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar active={activePage} onNav={handleNav} />
        {isAboutPage ? (
          <AboutPage onHome={() => handleNav("Home")} />
        ) : isTeamsPage ? (
          <TeamsPage onBack={handleBackFromTeams} />
        ) : (
          <>
            <HeroSection ready={introDone} />
            <div className="section-divider" />
            <SectionDeco />
            <ThemeSection />
            <div className="section-divider" />
            <SectionDeco />
            <AboutSection />
            <div className="section-divider" />
            <SectionDeco />
            <SpeakersSection />
            <div className="section-divider" />
            <SectionDeco />
            <TeamSection onViewAll={handleGoToTeams} />
            <div className="section-divider" />
            <SectionDeco />
            <MentorsSection />
            <EventDatePanel />
            <SectionDeco />
            <ContactSection />
            <div className="section-divider" />
            <SectionDeco />
            <SponsorsSection />
          </>
        )}
        <Footer onNav={handleNav} />
      </div>
    </div>
  );
}
