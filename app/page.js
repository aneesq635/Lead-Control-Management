'use client'
import Image from "next/image";
import HeroSection from "./component/HeroSection";
import { useSelector, useDispatch } from "react-redux";
export default function Home() {
    const dispatch = useDispatch();
    const selectedWorkspace = useSelector((state) => state.main.selectedWorkspace)

    return (
        <div className="min-h-screen bg-white selection:bg-black selection:text-white :bg-white :text-black transition-colors duration-300">
            <main>
                <HeroSection />
            </main>
        </div>
    );
}
