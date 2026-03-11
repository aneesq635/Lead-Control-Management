"use client";

import { AuthProvider } from "./AuthContext";
export function Providers({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}