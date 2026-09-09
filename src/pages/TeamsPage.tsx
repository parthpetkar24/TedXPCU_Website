import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ChromaGrid from '../components/ChromaGrid';

gsap.registerPlugin(ScrollTrigger);

const TEAM = [
  {
    name: "Aryan Raj",
    role: "Organiser",
    image: "/src/imports/Team/Aryan_Raj(2).png",
    color: "#ED2939"
  },
  {
    name: "Shradha Solanke",
    role: "Co-Organiser",
    image: "/src/imports/Team/Shradha_Solanke (2).png",
    color: "#ED2939"
  },
  {
    name: "Swapnil Adlinge",
    role: "Operations",
    image: "/src/imports/Team/Swapnil_Adlinge (2).png",
    color: "#ED2939"
  },
  {
    name: "Amrisha Vashishtha",
    role: "Digital Platform",
    image: "/src/imports/Team/Amrisha_Vashishtha (2).png",
    color: "#ED2939"
  },
  {
    name: "Shreya Singh",
    role: "EPM",
    image: "/src/imports/Team/Shreya_Singh (2).png",
    color: "#ED2939"
  },
  {
    name: "Sahil Gore",
    role: "Production",
    image: "/src/imports/Team/Sahil_Gore (2).png",
    color: "#ED2939"
  },
  {
    name: "Aditya Harpude",
    role: "Social Media",
    image: "/src/imports/Team/Aditya_Harpude (2).png",
    color: "#ED2939"
  },
  {
    name: "Pratiksha Ghonshikar",
    role: "Graphic Design",
    image: "/src/imports/Team/Pratiksha_Ghonshikar (2).png",
    color: "#ED2939"
  },
  {
    name: "Malhaar Jawalkar",
    role: "Hospitality",
    image: "/src/imports/Team/Malhaar_Jawalkar (2).png",
    color: "#ED2939"
  },
  {
    name: "Ashwani Singh",
    role: "Logistics",
    image: "/src/imports/Team/Ashwani_Singh (2).png",
    color: "#ED2939"
  },
  {
    name: "Sankalp Kale",
    role: "F&B",
    image: "/src/imports/Team/Sankalp_Kale (2).png",
    color: "#ED2939"
  },
  {
    name: "Tanishka Borude",
    role: "Documentation",
    image: "/src/imports/Team/Tanishka_Borude (2).png",
    color: "#ED2939"
  },
  {
    name: "Divyansh Gangurde",
    role: "Technical",
    image: "/src/imports/Team/Divyansh_Gangurde (2).png",
    color: "#ED2939"
  },
  {
    name: "Abha Kurumbansi",
    role: "Registration",
    image: "/src/imports/Team/Abha_Kurumbansi (2).png",
    color: "#ED2939"
  },
  {
    name: "Kashish Valecha",
    role: "Registration",
    image: "/src/imports/Team/Kashish_Valecha (2).png",
    color: "#ED2939"
  },
  {
    name: "Shreya Rai",
    role: "Cultural",
    image: "/src/imports/Team/Shreya_Rai (2).png",
    color: "#ED2939"
  },
  {
    name: "Vaishnavi Khandelwal",
    role: "Cultural",
    image: "/src/imports/Team/Vaishnavi_Khandelwal (2).png",
    color: "#ED2939"
  },
  {
    name: "Kunal Shinde",
    role: "Promotions",
    image: "/src/imports/Team/Kunal_Shinde (2).png",
    color: "#ED2939"
  },
  {
    name: "Viraj Mandekar",
    role: "Security",
    image: "/src/imports/Team/Viraj_Mandekar (2).png",
    color: "#ED2939"
  },
  

];

interface TeamsPageProps {
  onBack: () => void;
}
export default function TeamsPage({ onBack }: TeamsPageProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".teams-page-label", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".teams-page-label", start: "top 88%" },
      });
      gsap.from(".teams-page-heading", {
        opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".teams-page-heading", start: "top 88%" },
      });
      gsap.from(".teams-page-subtitle", {
        opacity: 0, y: 30, duration: 0.7, delay: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".teams-page-subtitle", start: "top 88%" },
      });
      gsap.from(".chroma-grid", {
        opacity: 0, y: 50, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ".chroma-grid", start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);
  const chromaItems = TEAM.map(member => ({
    image: member.image,
    title: member.name,
    subtitle: member.role,
    handle: `@${member.name.toLowerCase().replace(/\s+/g, '')}`,
    borderColor: member.color,
    gradient: `linear-gradient(145deg, ${member.color}, #000)`,
    url: "#" // Optional URL
  }));
  return (
    <div ref={sectionRef} className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          className="text-sm mb-8 flex items-center gap-2 transition-colors hover:text-red-400"
          style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans", background: "none", border: "none", cursor: "pointer" }}
        >
          ← Back to Home
        </button>
        {/* Page header */}
        <div className="text-center mb-16">
          <span className="teams-page-label text-xs font-semibold tracking-widest uppercase" style={{ color: "#ED2939", fontFamily: "Rajdhani" }}>◆ Our People</span>
          <h1 className="teams-page-heading text-5xl md:text-7xl font-bold mt-4" style={{ fontFamily: "Oswald", color: "#F5F7FA", textTransform: "uppercase" }}>
            The Full Team
          </h1>
          <p className="teams-page-subtitle mt-4 max-w-lg mx-auto" style={{ color: "#8A96A4", fontFamily: "IBM Plex Sans" }}>
            Every great event is built by an extraordinary team. Meet the people behind TEDxPCU.
          </p>
        </div>
        {/* Profile Cards Grid -> ChromaGrid */}
        <div style={{ position: 'relative' }}>
          <ChromaGrid 
            items={chromaItems}
            radius={300}
            damping={0.45}
            fadeOut={0.6}
            ease="power3.out"
          />
        </div>
      </div>
    </div>
  );
}