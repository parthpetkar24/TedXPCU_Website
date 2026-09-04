import { useEffect, useRef } from "react";
import gsap from "gsap";

const ABOUT_CARDS = [
  {
    id: "ted",
    kicker: "The Conference",
    title: "TED",
    teaser: "Ideas worth spreading.",
    body: "TED is a nonprofit, nonpartisan organization dedicated to discovering, debating and spreading ideas that spark conversation, deepen understanding and drive meaningful change. Our organization is devoted to curiosity, reason, wonder and the pursuit of knowledge — without an agenda. We welcome people from every discipline and culture who seek a deeper understanding of the world and connection with others, and we invite everyone to engage with ideas and activate them in your community.TED began in 1984 as a conference where Technology, Entertainment and Design converged, but today it spans a multitude of worldwide communities and initiatives exploring everything from science and business to education, arts and global issues. In addition to the TED Talks curated from our annual conferences and published on TED.com, we produce original podcasts, short video series, animated educational lessons (TED-Ed) and TV programs that are translated into more than 100 languages and distributed via partnerships around the world. Each year, thousands of independently run TEDx events. Through the Audacious Project, TED has helped catalyze $6.6 billion in funding for projects that support bold solutions to the world's most urgent challenges — working to make the world more beautiful, sustainable and just. In 2020, TED launched Countdown, an initiative to accelerate solutions to the climate crisis and mobilize a movement for a net-zero future, and in 2023 TED launched TED Democracy to spark a new kind of conversation focused on realistic pathways towards a more vibrant and equitable future. View a full list of TED's many programs and initiatives.",
  },
  {
    id: "tedx",
    kicker: "Independently Organized",
    title: "TEDx",
    teaser: "x = independently organized TED event.",
    body: "In the spirit of discovering and spreading ideas, TEDx is a program of local, self-organized events that bring people together to share a TED-like experience. At a TEDx event, TED Talks video and live speakers combine to spark deep discussion and connection. These local, self-organized events are branded TEDx, where x = independently organized TED event. The TED Conference provides general guidance for the TEDx program, but individual TEDx events are self-organized. (Subject to certain rules and regulations.)",
  },
];

type AboutPageProps = {
  onHome: () => void;
};

export default function AboutPage({ onHome }: AboutPageProps) {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".about-page-label", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" });
      gsap.from(".about-page-heading", { opacity: 0, y: 36, duration: 0.8, delay: 0.08, ease: "power3.out" });
      gsap.from(".about-page-copy", { opacity: 0, y: 24, duration: 0.7, delay: 0.16, ease: "power3.out" });
      gsap.from(".about-info-card", { opacity: 0, y: 40, duration: 0.8, stagger: 0.12, delay: 0.22, ease: "power3.out" });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={pageRef} className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={onHome}
          className="text-sm mb-8 flex items-center gap-2 transition-colors hover:text-red-400"
          style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          ← Back to Home
        </button>
        <span className="about-page-label text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>◆ Origins</span>
        <h1 className="about-page-heading text-5xl md:text-6xl font-bold mt-4 mb-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>About</h1>
        <p className="about-page-copy mb-12 max-w-2xl" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
          Hover a card to learn what TED is — and how TEDx brings that spirit to a local stage.
        </p>

        <div className="about-info-grid">
          {ABOUT_CARDS.map((card) => (
            <article
              key={card.id}
              className="about-info-card p-8 md:p-10"
              tabIndex={0}
              aria-label={`${card.title}. Hover or focus to read more.`}
            >
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l pointer-events-none" style={{ borderColor: "rgba(237,41,57,0.35)" }} />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r pointer-events-none" style={{ borderColor: "rgba(237,41,57,0.35)" }} />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l pointer-events-none" style={{ borderColor: "rgba(237,41,57,0.35)" }} />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r pointer-events-none" style={{ borderColor: "rgba(237,41,57,0.35)" }} />

              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani", fontWeight: 700 }}>{card.kicker}</span>
              <h2 className="text-5xl md:text-6xl font-bold mt-4 mb-3" style={{ fontFamily: "Inter", color: "#F5F7FA", letterSpacing: "-0.03em", textTransform: "none" }}>
                {card.id === "tedx" ? (
                  <>
                    <span style={{ color: "#EB0028", fontWeight: 700 }}>TED</span>
                    <span style={{ color: "#EB0028", fontWeight: 700, fontSize: "0.55em", position: "relative", top: "-0.55em" }}>x</span>
                  </>
                ) : (
                  <span style={{ color: "#EB0028", fontWeight: 800 }}>{card.title}</span>
                )}
              </h2>
              <p className="text-base" style={{ color: "#AAB4C0", fontFamily: "Rajdhani", fontWeight: 600 }}>{card.teaser}</p>
              <div className="about-info-body">
                <div>
                  <div className="section-divider my-1 opacity-30" />
                  <p className="text-sm md:text-base leading-relaxed pt-4" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>{card.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
