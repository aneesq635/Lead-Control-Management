"use client";

import { AuthProvider } from "./AuthContext";
import { Provider } from "react-redux";
import { store } from "./Store";
export function Providers({ children }) {
    return (
        <AuthProvider>
            <Provider store={store}>
                {children}
            </Provider>
        </AuthProvider>
    );
}