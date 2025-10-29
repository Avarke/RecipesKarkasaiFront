import axios, { AxiosInstance } from 'axios';

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

let backend = axios.create();

/**
 * Set backend connector to version that automatically authenticates to the server with given JWT.
 * @param jwt JWT to use.
 */
function setAuthenticatingBackend(jwt : string) {
    backend =
        axios.create({
            headers : {
                Authorization: `Bearer ${jwt}`
            }
        });
}

/**
 * Set backend connector to non-authenticating version.
 */
function setNonAuthenticatingBackend() {
    backend = axios.create();
}

//
export {
    backend as default,
    setAuthenticatingBackend,
    setNonAuthenticatingBackend
}