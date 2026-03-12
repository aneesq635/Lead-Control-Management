import Image from "next/image";
import HeroSection from "./component/HeroSection";
export default function Home() {
 return (
 <div className="min-h-screen bg-white selection:bg-black selection:text-white :bg-white :text-black transition-colors duration-300">
 <main>
 <HeroSection />
 </main>
 </div>
 );
}
