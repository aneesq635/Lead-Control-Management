"use client";

import { AuthProvider } from "./AuthContext";
import { Provider } from "react-redux";
import { store } from "./Store";
import { DataLoader } from "./DataLoader";

export function Providers({ children }) {
    return (
        <AuthProvider>
            <Provider store={store}>
                <DataLoader />
                {children}
            </Provider>
        </AuthProvider>
    );
}