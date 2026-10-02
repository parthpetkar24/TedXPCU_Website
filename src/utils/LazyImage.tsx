import { useState, useRef, useEffect } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Extra distance (in px) before viewport to start loading */
  rootMargin?: string;
}

/**
 * Lazy-loaded image with a shimmer placeholder and fade-in transition.
 * Uses IntersectionObserver to defer loading until the image is near the viewport.
 */
export default function LazyImage({
  src,
  alt,
  rootMargin = "300px",
  className = "",
  style,
  ...rest
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={imgRef}
      className={className}
      style={{
        ...style,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer placeholder */}
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, rgba(255,255,255,0.02) 8%, rgba(255,255,255,0.06) 18%, rgba(255,255,255,0.02) 33%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite linear",
            zIndex: 1,
          }}
        />
      )}

      {/* Actual image — only rendered when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.4s ease-in-out",
          }}
          {...rest}
        />
      )}
    </div>
  );
}
