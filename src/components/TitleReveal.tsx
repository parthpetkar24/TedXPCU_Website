import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import "./TitleReveal.css";

gsap.registerPlugin(CustomEase);

if (!CustomEase.get("trCinematic")) {
  CustomEase.create("trCinematic", "M0,0 C0.16,1 0.3,1 1,1");
}
if (!CustomEase.get("trPunch")) {
  CustomEase.create("trPunch", "M0,0 C0.2,0.9 0.32,1 1,1");
}
if (!CustomEase.get("trWipe")) {
  CustomEase.create("trWipe", "M0,0 C0.77,0 0.175,1 1,1");
}

export const TITLE_REVEAL_TIMING = {
  blackHold: 0.3,
  atmosphere: 0.35,
  xStart: 0.5,
  xVisible: 0.8,
  xHold: 1.1,
  geometryStart: 1.3,
  titleStart: 1.6,
  titleRecognizable: 2.4,
  titleComplete: 3.0,
  logoHold: 1.0,
  exitDuration: 0.55,
} as const;

export const TITLE_REVEAL_COLORS = {
  background: "#000000",
  accent: "#EB0028",
  white: "#FFFFFF",
} as const;

export type TitleRevealProps = {
  logo?: string;
  accentColor?: string;
  backgroundColor?: string;
  onComplete?: () => void;
  replayKey?: number;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function parseLogo(logo: string) {
  const compact = logo.replace(/\s+/g, "");
  const match = compact.match(/^(TED)x?(.*)$/i);
  if (match) {
    return { ted: "TED", x: "x", rest: match[2] || "PCU" };
  }
  const mid = Math.max(1, Math.floor(compact.length / 2));
  return { ted: compact.slice(0, mid), x: "x", rest: compact.slice(mid) };
}

export default function TitleReveal({
  logo = "TEDXPCU",
  accentColor = TITLE_REVEAL_COLORS.accent,
  backgroundColor = TITLE_REVEAL_COLORS.background,
  onComplete,
  replayKey = 0,
}: TitleRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const { ted, x, rest } = parseLogo(logo);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    document.body.style.removeProperty("overflow");
    onCompleteRef.current?.();
  }, []);

  const skipToEnd = useCallback(() => {
    const timeline = timelineRef.current;
    if (timeline) {
      timeline.progress(1);
      return;
    }
    finish();
  }, [finish]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    completedRef.current = false;
    document.body.style.overflow = "hidden";

    const q = gsap.utils.selector(root);
    const ctx = gsap.context(() => {
      const heroX = q(".title-reveal__hero-x");
      const glow = q(".title-reveal__hero-x-glow");
      const atmosphere = q(".title-reveal__atmosphere");
      const grain = q(".title-reveal__grain");
      const logoMask = q(".title-reveal__logo-mask");
      const rule = q(".title-reveal__rule");
      const skip = q(".title-reveal__skip");
      const square = q(".title-reveal__square");
      const circle = q(".title-reveal__circle");
      const triangle = q(".title-reveal__triangle");
      const lineH = q(".title-reveal__line--h");
      const lineV = q(".title-reveal__line--v");
      const panelL = q(".title-reveal__panel--left");
      const panelR = q(".title-reveal__panel--right");

      if (prefersReducedMotion()) {
        gsap.set(heroX, { opacity: 0 });
        gsap.set(logoMask, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          clipPath: "inset(0% 0% 0% 0%)",
        });
        gsap.set(atmosphere, { opacity: 0.35 });
        const reduced = gsap.timeline({
          onComplete: finish,
        });
        reduced
          .to(logoMask, {
            delay: 0.35,
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
          })
          .to(root, {
            autoAlpha: 0,
            duration: 0.25,
            ease: "power2.out",
          }, "-=0.05");
        timelineRef.current = reduced;
        return;
      }

      gsap.set(heroX, {
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
        scale: 0.4,
        rotation: -12,
        filter: "blur(12px)",
      });
      gsap.set(glow, { opacity: 0, scale: 0.6 });
      gsap.set(atmosphere, { opacity: 0, scale: 1.08 });
      gsap.set(grain, { opacity: 0 });
      gsap.set(logoMask, {
        opacity: 0,
        y: 40,
        filter: "blur(10px)",
        clipPath: "inset(100% 0% 0% 0%)",
      });
      gsap.set(rule, { opacity: 0, scaleX: 0.2 });
      gsap.set(skip, { opacity: 0 });
      gsap.set([square, circle], { opacity: 0, scale: 0.72, rotation: 0 });
      gsap.set(triangle, { opacity: 0, y: 24, scale: 0.6 });
      gsap.set(lineH, { opacity: 0, scaleX: 0 });
      gsap.set(lineV, { opacity: 0, scaleY: 0 });
      gsap.set(panelL, { opacity: 1, xPercent: -100 });
      gsap.set(panelR, { opacity: 1, xPercent: 100 });

      const t = TITLE_REVEAL_TIMING;
      const tl = gsap.timeline({
        defaults: { ease: "trCinematic" },
        onComplete: finish,
      });

      tl.to(atmosphere, { opacity: 1, scale: 1, duration: t.atmosphere }, t.blackHold)
        .to(grain, { opacity: 0.045, duration: 0.6 }, t.blackHold)
        .to(skip, { opacity: 1, duration: 0.4 }, t.blackHold + 0.4);

      tl.to(
        heroX,
        {
          opacity: 1,
          scale: 1.15,
          rotation: 0,
          filter: "blur(0px)",
          duration: t.xVisible - t.xStart,
          ease: "trPunch",
        },
        t.xStart,
      )
        .to(
          glow,
          { opacity: 0.85, scale: 1, duration: 0.35, ease: "power2.out" },
          t.xStart + 0.08,
        )
        .to(
          heroX,
          { scale: 1, duration: t.xHold - t.xVisible, ease: "power2.out" },
          t.xVisible,
        )
        .to(
          glow,
          { opacity: 0.4, duration: 0.7, ease: "sine.inOut" },
          t.xVisible,
        );

      tl.to(
        square,
        { opacity: 0.9, scale: 1, rotation: 0, duration: 0.7, ease: "power3.out" },
        t.geometryStart,
      )
        .to(
          circle,
          { opacity: 0.7, scale: 1, duration: 0.85, ease: "power3.out" },
          t.geometryStart + 0.08,
        )
        .to(
          lineH,
          { opacity: 0.7, scaleX: 1, duration: 0.55, ease: "power4.out" },
          t.geometryStart + 0.12,
        )
        .to(
          lineV,
          { opacity: 0.55, scaleY: 1, duration: 0.55, ease: "power4.out" },
          t.geometryStart + 0.16,
        )
        .fromTo(
          triangle,
          { opacity: 0, y: 28, scale: 0.7 },
          { opacity: 0.95, y: 0, scale: 1, duration: 0.65, ease: "power3.out" },
          t.geometryStart + 0.18,
        )
        .to(
          panelL,
          { xPercent: 0, duration: 0.22, ease: "power4.inOut" },
          t.geometryStart + 0.05,
        )
        .to(
          panelR,
          { xPercent: 0, duration: 0.22, ease: "power4.inOut" },
          t.geometryStart + 0.05,
        )
        .to(
          panelL,
          { xPercent: -102, duration: 0.55, ease: "trWipe" },
          t.titleStart,
        )
        .to(
          panelR,
          { xPercent: 102, duration: 0.55, ease: "trWipe" },
          t.titleStart,
        );

      tl.to(
        logoMask,
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          filter: "blur(4px)",
          duration: t.titleRecognizable - t.titleStart,
          ease: "power3.inOut",
        },
        t.titleStart,
      )
        .to(
          heroX,
          {
            scale: 0.18,
            opacity: 0,
            filter: "blur(8px)",
            duration: 0.7,
            ease: "power3.inOut",
          },
          t.titleStart + 0.12,
        )
        .to(glow, { opacity: 0, duration: 0.45 }, t.titleStart + 0.1)
        .to(
          [square, circle, lineH, lineV, triangle],
          { opacity: 0.18, duration: 0.6, ease: "power2.out" },
          t.titleStart + 0.25,
        )
        .to(
          logoMask,
          {
            filter: "blur(0px)",
            scale: 1.02,
            duration: t.titleComplete - t.titleRecognizable,
            ease: "power2.out",
          },
          t.titleRecognizable,
        )
        .to(rule, { opacity: 1, scaleX: 1, duration: 0.5 }, t.titleRecognizable + 0.1)
        .to(logoMask, { scale: 1, duration: 0.35, ease: "power2.out" }, t.titleComplete);

      const exitAt = t.titleComplete + t.logoHold;
      tl.to(
        [square, circle, triangle, lineH, lineV, rule, skip],
        { opacity: 0, duration: 0.28, ease: "power2.in" },
        exitAt,
      )
        .to(
          logoMask,
          {
            opacity: 0,
            filter: "blur(10px)",
            scale: 0.92,
            duration: 0.7,
            ease: "power3.inOut",
          },
          exitAt,
        )
        .to(
          [atmosphere, grain],
          { opacity: 0, duration: 0.45, ease: "power2.in" },
          exitAt + 0.25,
        )
        .to(
          root,
          {
            autoAlpha: 0,
            duration: t.exitDuration,
            ease: "power2.inOut",
          },
          exitAt + 0.35,
        )
        .set(root, { pointerEvents: "none" });

      timelineRef.current = tl;
    }, root);

    return () => {
      ctx.revert();
      timelineRef.current = null;
      document.body.style.removeProperty("overflow");
    };
  }, [finish, replayKey, accentColor, backgroundColor, logo]);

  return (
    <div
      ref={rootRef}
      className="title-reveal"
      role="dialog"
      aria-modal="true"
      aria-label="TEDxPCU opening sequence"
      style={{
        ["--tr-bg" as string]: backgroundColor,
        ["--tr-accent" as string]: accentColor,
      }}
    >
      <button type="button" className="title-reveal__skip" onClick={skipToEnd}>
        Skip
      </button>

      <div className="title-reveal__atmosphere" />
      <div className="title-reveal__grain" />

      <div className="title-reveal__geometry" aria-hidden="true">
        <div className="title-reveal__shape title-reveal__circle" />
        <div className="title-reveal__shape title-reveal__square" />
        <div className="title-reveal__shape title-reveal__line title-reveal__line--h" />
        <div className="title-reveal__shape title-reveal__line title-reveal__line--v" />
        <div className="title-reveal__shape title-reveal__triangle" />
        <div className="title-reveal__shape title-reveal__triangle title-reveal__triangle--bottom" />
        <div className="title-reveal__panel title-reveal__panel--left" />
        <div className="title-reveal__panel title-reveal__panel--right" />
      </div>

      <div className="title-reveal__stage">
        <div className="title-reveal__hero-x" aria-hidden="true">
          <span className="title-reveal__hero-x-glow" />
          {x}
        </div>

        <div className="title-reveal__logo-mask">
          <h1 className="title-reveal__logo">
            <span className="title-reveal__ted">{ted}</span>
            <span className="title-reveal__x">{x}</span>
            <span className="title-reveal__pcu">{rest}</span>
          </h1>
        </div>
      </div>

      <div className="title-reveal__rule" aria-hidden="true" />
    </div>
  );
}
