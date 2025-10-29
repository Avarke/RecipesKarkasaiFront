import appState from "./appState";

/**
 * Show success message.
 * @param msg Message content.
 */
function notifySuccess(msg : string) {
    appState.msgs.next({
        severity : "success",
        summary : "Operation success.",
        detail : msg,
        life : 5000
    })
}

/**
 * Show failure message.
 * @param msg Message content.
 */
function notifyFailure(msg: string) {
    appState.msgs.next({
        severity : "warn",
        summary : "Operation failure.",
        detail : msg,
        sticky : true
    })
}

//
export {
    notifySuccess,
    notifyFailure
}