import * as signalR from "@microsoft/signalr";
import { USER_LOGIN_FINISHED, USER_LOGGED_OUT } from "modules/user/actions";

const signal = ({ callbacks, onStart = () => { }, url, logLevel = signalR.LogLevel.Error, connectionOptions = {} }) => store => {

    const buildConnection = () => {
        let connection = new signalR.HubConnectionBuilder()
            .configureLogging(logLevel)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    if (retryContext.elapsedMilliseconds < 60000) {
                        // If we've been reconnecting for less than 60 seconds so far,
                        // wait between 0 and 5 seconds before the next reconnect attempt 
                        // (and space out the requests so the server doesn't get hammered)
                        return Math.random() * 5000;
                    } else {
                        // If we've been reconnecting for more than 60 seconds so far, wait 30 seconds between each attempt.
                        return 30000;
                    }
                }
            })
            .withUrl(url, connectionOptions)
            .build();


        const { callbackMap } = callbacks;
        for (const [name, callback] of callbackMap) {
            connection.on(name, (...args) => {
                callback.call(null, ...args).call(store, store.dispatch.bind(store), store.getState.bind(store));
            });
        }

        return connection;
    };

    let connection = buildConnection();

    const ensureConnection = () => {
        if (connection.state === signalR.HubConnectionState.Disconnected) {

            connection.start().then(function () {
                onStart();
            }).catch(function (err) {
                setTimeout(ensureConnection, 15000);
                return console.error("ensureConnection start error:  " + err.toString());

            });
        }
    }

    connection.onclose(error => {
        setTimeout(ensureConnection, 15000);
    });


    ensureConnection();

    // Are you debugging and seeing an error here?  It's very likely the error is just as a result
    // of whatever action you just dispatched to the Redux store and the new UI that React is rendering
    // as a result.  This line of code calls the next item in the chain, so this function shows up as the earliest
    // code we own in the call stack as actions percolate through, but it hopefully isn't the source of your bug.
    return next => action => {
        // If the user just logged in, try to connect right away.
        if (action && action.type && action.type === USER_LOGIN_FINISHED) {
            ensureConnection();
        }

        else if (action && action.type && action.type === USER_LOGGED_OUT) {
            // If the user logged out, we'll remove and recreate the connection.
            // Because the token factory creates the token in a function, we can
            // reuse all the same information that was passed in to the original instance.
            //
            // The callback is listed twice so it runs whether the stop-connection promise is fulfilled or rejected.
            //
            // We expect the new connection to fail the first time we try, but that's okay;  it'll keep retrying and 
            // eventually work once the new login is completed.
            connection.stop().then(() => { connection = buildConnection() }, () => { connection = buildConnection() });
        }

        // Pass on the action to the next middleware.
        return typeof action === 'function'
            ? action(store.dispatch.bind(store), store.getState.bind(store), connection.invoke.bind(connection))
            : next(action)
    }
}

export default signal;