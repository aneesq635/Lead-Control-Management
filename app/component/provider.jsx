"use client";

import { AuthProvider } from "./AuthContext";
import { Provider } from "react-redux";
import { store } from "./Store";
import { DataLoader } from "./DataLoader";
import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
                <Provider store={store}>
                    <DataLoader />
                    {children}
                </Provider>
            </AuthProvider>
        </ThemeProvider>
    );
}