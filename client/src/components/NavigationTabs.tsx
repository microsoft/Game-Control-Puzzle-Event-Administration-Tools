import { Nav, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector } from "react-redux";

import { getChallengePluralNameSetting, getIsUserAdmin, getIsUserSignedIn, getIsUserStaff } from "modules";

export const NavigationTabs = () => {
    const isUserSignedIn = useSelector(getIsUserSignedIn);
    const isUserStaff = useSelector(getIsUserStaff);
    const isUserAdmin = useSelector(getIsUserAdmin);

    const challengesPluralName = useSelector(getChallengePluralNameSetting);

    if (!isUserSignedIn) {
        return (
            <Nav>
                <LinkContainer to="/">
                    <Nav.Link eventKey={1}>Home</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/logout">
                    <Nav.Link eventKey={2}>Log out</Nav.Link>
                </LinkContainer>
            </Nav>
        );
    } else if (isUserStaff) {
        return (
            <Nav>
                <LinkContainer to="/staff/clues">
                    <Nav.Link eventKey={1}>Puzzles</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/staff/teams">
                    <Nav.Link eventKey={2}>Teams</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/staff/feed">
                    <Nav.Link eventKey={3}>Activity</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/staff/actioncenter">
                    <Nav.Link eventKey={4}>Action Center</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/staff/grid">
                    <Nav.Link eventKey={5}>Grid</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/staff/achievements">
                    <Nav.Link eventKey={6}>Achievements</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/staff/messages">
                    <Nav.Link eventKey={7}>Messages</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/staff/challenges">
                    <Nav.Link eventKey={8}>{challengesPluralName}</Nav.Link>
                </LinkContainer>
                {
                    isUserAdmin &&
                    <NavDropdown title="Admin" id="basic-nav-dropdown">
                        <LinkContainer to="/admin/settings">
                            <Nav.Link eventKey={9.1}>Settings</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/summary">
                            <Nav.Link eventKey={9.2}>Summary</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/users">
                            <Nav.Link eventKey={9.3}>Users</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/events">
                            <Nav.Link eventKey={9.4}>Events</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/keys">
                            <Nav.Link eventKey={9.5}>API Keys</Nav.Link>
                        </LinkContainer>
                    </NavDropdown>
                }
                <LinkContainer to="/logout">
                    <Nav.Link eventKey={10}>Log out</Nav.Link>
                </LinkContainer>
            </Nav>
        );
    } else {
        // Otherwise this is a player
        return (
            <Nav>
                <LinkContainer to="/player/home">
                    <Nav.Link eventKey={1}>Home</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/player/clues">
                    <Nav.Link eventKey={2}>Puzzles</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/player/pulse">
                    <Nav.Link eventKey={3}>Pulse</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/player/messages">
                    <Nav.Link eventKey={4}>Inbox</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/player/feed">
                    <Nav.Link eventKey={5}>Activity</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/player/achievements">
                    <Nav.Link eventKey={6}>Achievements</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/player/challenges">
                    <Nav.Link eventKey={7}>{challengesPluralName}</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/logout">
                    <Nav.Link eventKey={8}>Log out</Nav.Link>
                </LinkContainer>
            </Nav>
        );
    }
};