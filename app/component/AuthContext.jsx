import { createContext, useContext, useEffect, useState } from "react";
import supabase from "./supabase";

// import { socketURL } from "./socketInstance";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // creating hooks
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState();
    const [refreshToken, setRefreshToken] = useState();
    useEffect(() => {
        const initializeSession = async () => {
            try {
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) {
                    console.error("Session initialization error:", error);
                    return;
                }

                if (session) {
                    setUser(session.user);

                    setAccessToken(session.access_token);
                    setRefreshToken(session.refresh_token);
                }
            } catch (error) {
                console.error("Unexpected error during session initialization:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setAccessToken(session?.access_token ?? null);
            setRefreshToken(session?.refresh_token ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshAccessToken = async () => {
        if (!refreshToken) return false;

        try {
            const {
                data: { session },
                error,
            } = await supabase.auth.refreshSession({
                refresh_token: refreshToken,
            });

            if (error) {
                console.error("Token refresh error:", error);
                return false;
            }

            if (session) {
                setAccessToken(session.access_token);
                setRefreshToken(session.refresh_token);
                setUser(session.user);

                return true;
            }

            return false;
        } catch (error) {
            console.error("Unexpected error during token refresh:", error);
            return false;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setAccessToken(null);
            setRefreshToken(null);
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                accessToken,
                refreshAccessToken,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 
