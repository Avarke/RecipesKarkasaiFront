import backend, {setAccessToken, setNonAuthenticatingBackend} from "../app/backend";
import appState from "../app/appState";
import { jwtDecode } from "jwt-decode";
import {notifySuccess} from "../app/notify";

type MyJwtPayload = {
    role?: string | string[];
    sub?: string;
    unique_name?: string;
    name?: string;
};

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            // IMPORTANT: endpoint is /accessToken
            const resp = await backend.post("/accessToken");

            const token = resp.data?.accessToken as string | undefined;
            if (!token) return null;

            // store token in session storage
            appState.authJwt = token;
            // console.log("accessToken", token);
            setAccessToken(token);

            // decode and restore user info (optional but nice)
            const decoded: any = jwtDecode<MyJwtPayload>(token);

            // roles extraction (supports ASP.NET role URI)
            const rawRole =
                decoded.role ??
                decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

            const roles =
                Array.isArray(rawRole) ? rawRole :
                    typeof rawRole === "string" ? [rawRole] :
                        [];

            appState.userRoles = roles;
            appState.userId = decoded.sub ?? appState.userId;
            appState.userTitle =
                decoded.unique_name ??
                decoded.name ??
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
                appState.userTitle;

            appState.isLoggedIn.value = true;

            return token;
        } catch {
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export function forceLogout() {
    notifySuccess("Logout successful.");
    appState.userId = "";
    appState.userTitle = "";
    appState.userRoles = [];
    appState.authJwt = null;
    setAccessToken(null);
    setNonAuthenticatingBackend();
    appState.isLoggedIn.value = false;
}
