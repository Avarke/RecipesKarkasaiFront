import axios, { AxiosInstance } from 'axios';
import config from "./config";
import { refreshAccessToken, forceLogout } from "../auth/tokenService";
import appState from "./appState";
import {notifyFailure} from "./notify";

/**
 * This module exposes a separate axios instance to be used for connections to backend.
 *
 * Default instance of backend connector is non-authenticating.
 *
 * When user logs in via LogIn or DevelopmentLogIn the backend connector is replaced by the 
 * authenticating version. The authenticating version automatically adds the header to pass
 * JWT to the server.
 * 
 * When user logs out via StatusAndLogOut, the backend is replaced by non-authenticating version.
 *
 * The App component check if JWT is present on initialization. If so, it switches to authenticating
 * backend connector. This allows non-root route URLs to work as long as proper JWT is present in session
 * state.
 */






let accessToken: string | null = null;



let onNotFoundRedirect: (() => void) | null = null;
export function setOnNotFoundRedirect(fn: (() => void) | null) {
    onNotFoundRedirect = fn;
}

const backend = axios.create({
    baseURL: config.backendUrl,
    withCredentials: true,
});

backend.interceptors.request.use((req) => {
    if (accessToken) {
        req.headers.Authorization = `Bearer ${accessToken}`;
    } else {
        // ensure it's not accidentally kept
        delete req.headers.Authorization;
    }
    return req;
});

// TEMPORARY
backend.interceptors.request.use((req) => {
    if (accessToken) req.headers.Authorization = `Bearer ${accessToken}`;
    else delete req.headers.Authorization;
    console.log("REQUEST", req.method, req.url, "Auth:", req.headers?.Authorization);
    console.log("accessToken var:", accessToken);
    console.log("appState.authJwt:", appState.authJwt);
    return req;
});

/** On 401, try refresh once, then retry the original request. */
backend.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error?.response?.status;
        const originalRequest = error?.config;

            if (status === 404) {
                notifyFailure(
                    "The requested recipe was not found or you do not have access to it."
                );

                onNotFoundRedirect?.();

                return Promise.reject(error);
            }

        if ((status !== 401 && status !== 403) || !originalRequest) {
            return Promise.reject(error);
        }
        // Avoid infinite loops
        if (originalRequest._retry) {
            forceLogout();
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        // Try to refresh access token
        const newToken = await refreshAccessToken();

        if (!newToken) {
            // Refresh failed -> log user out
            forceLogout();
            return Promise.reject(error);
        }

        setAccessToken(newToken);

        return backend(originalRequest);
    }
);

export function setAccessToken(token: string | null) {
    accessToken = token;
}

/**
 * Set backend connector to version that automatically authenticates to the server with given JWT.
 * @param jwt JWT to use.
 */
function setAuthenticatingBackend(jwt: string) {
    backend.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
}

/**
 * Set backend connector to non-authenticating version.
 */
function setNonAuthenticatingBackend() {
    delete backend.defaults.headers.common["Authorization"];
}

//
export {
    backend as default,
    setAuthenticatingBackend,
    setNonAuthenticatingBackend
}