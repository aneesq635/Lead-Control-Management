// app/component/ConditionalHeader.jsx
"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
    const pathname = usePathname();
    const hiddenRoutes = ["/dashboard"];
    
    const shouldHideHeader = hiddenRoutes.some(route => 
        pathname.startsWith(route)
    );

    if (shouldHideHeader) return null;
    
    return <Header />;
}