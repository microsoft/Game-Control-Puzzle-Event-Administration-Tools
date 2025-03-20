import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Alert, Navbar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import moment from 'moment';
import 'moment-timezone';

import '../App.css';
import Logo from './brand/logo.svg';
import pkg from '../../package.json';
import { getPlayerInbox, PlayerMessage } from 'modules/player';
import { getEventName, getIsUserAdmin, getIsUserSignedIn, getIsUserStaff, getUser, getUserName } from 'modules';

import Routes from './Routes';
import { NavigationTabs } from './NavigationTabs';
import { dismissPlayerMessage, fetchPlayerMessages } from 'modules/player/messages/service';

const RecentMessages = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const messagesState = useSelector(getPlayerInbox);
    const recentMessages = messagesState.data.filter((message: PlayerMessage) => moment.utc().diff(moment.utc(message.lastUpdated), 'hours') < 2 && message.isDismissed !== true);

    useEffect(() => {
        const unlisten = history.listen((location, action) => {
            if (location.pathname !== '/logout' && location.pathname !== '/') {
                dispatch(fetchPlayerMessages());
            }
        });

        return unlisten();
    }, [dispatch, history]);

    return (
        <div>
            {recentMessages.map((message: PlayerMessage) => (
                <Alert variant="warning" key={message.messageId} onClose={() => dispatch(dismissPlayerMessage(message.messageId))} dismissible>
                    {message.messageText}
                </Alert>
            ))}
        </div>
    );
};

// TODO: This could come in handy for cleaning up possible routes/links for
// different user auth.
// https://reacttraining.com/react-router/web/example/route-config
const App = () => {
    const eventName = useSelector(getEventName);
    const userName = useSelector(getUserName);
    const user = useSelector(getUser);
    const isUserSignedIn = useSelector(getIsUserSignedIn);
    const isUserStaff = useSelector(getIsUserStaff);
    const isUserAdmin = useSelector(getIsUserAdmin);

    const EventName = () => {
        if (isUserSignedIn) {
            return <>{eventName}</>;
        } else {
            return <>Not Logged In</>;
        }
    };

    const UserName = () => {
        if (isUserSignedIn) {
            if (isUserAdmin) {
                return <>{`Logged in as ${userName} (Admin)`}</>;
            } else if (isUserStaff) {
                return <>{`Logged in as ${userName} (Staff)`}</>;
            } else {
                return <>{`Logged in as ${userName} (${user.teamName})`}</>;
            }
        } else {
            return <>Not Logged In</>;
        }
    };

    return (
        <div className="App">
            <header className={isUserStaff ? 'App-header-staff' : 'App-header'}>
                <img className={isUserStaff ? 'App-header-logo-staff' : 'App-header-logo'} alt={`Welcome to ${eventName}`} src={Logo} />
                <div className="App-header-userInfo">
                    <div className="eventName">
                        <EventName />
                    </div>
                    <div className="userInfo">
                        <UserName />
                        <br />
                        Version: {pkg.version}
                    </div>
                </div>
            </header>
            <Navbar className="nav nav-tabs" collapseOnSelect expand="md">
                <Navbar.Toggle aria-controls="navbar-options" className="App-header-toggle" />
                <Navbar.Collapse id="navbar-options">
                    <NavigationTabs />
                </Navbar.Collapse>
            </Navbar>

            <main>
                {isUserSignedIn && !isUserStaff && <RecentMessages />}
                <Routes />
            </main>
        </div>
    );
};

export default withRouter(App);
