"use client";

import { AuthProvider } from "./AuthContext";
import { Provider } from "react-redux";
import { store } from "./Store";
import { DataLoader } from "./DataLoader";
import { ThemeProvider } from "next-themes";
import {SnackbarProvider } from "notistack";

export function Providers({ children }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SnackbarProvider maxSnack={3} autoHideDuration={1000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <AuthProvider>
                <Provider store={store}>
                    <DataLoader />
                    {children}
                </Provider>
            </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}