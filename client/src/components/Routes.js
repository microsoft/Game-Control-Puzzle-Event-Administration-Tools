import React from 'react';
import { Route } from 'react-router-dom';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper';

import { Home } from '../Home'
import { Login } from '../Login'
import { LegacyLogin } from './user/LegacyLogin';

import { AvailableClues } from './player/AvailableClues'
import { PlayerPlot } from "./player/PlayerPlot";
import { PlayerClueDetails } from './player/PlayerClueDetails'
import { PlayerPulse } from './player/PlayerPulse'
import { PlayerInbox } from './player/PlayerInbox'
import { PlayerAchievements } from './player/PlayerAchievements';
import { PlayerFeed } from './player/PlayerFeed';
import { Challenges as PlayerChallenges } from './player/Challenges';
import { ChallengeDetails as PlayerChallengeDetails } from './player/ChallengeDetails';

import { StaffClues } from './staff/StaffClues'
import StaffClueDetails from './staff/StaffClueDetails'
import { StaffFeed } from './staff/StaffFeed'
import { StaffGrid } from './staff/StaffGrid'
import { StaffTeams } from './staff/StaffTeams'
import { StaffTeamDetails } from './staff/StaffTeamDetails'
import { StaffAchievements } from './staff/StaffAchievements'
import { StaffSendMessage } from './staff/StaffSendMessage'
import { Challenges as StaffChallenges } from './staff/Challenges';
import { StaffChallengeDetails } from './staff/StaffChallengeDetails';

import { AdminEvents } from './admin/AdminEvents'
import { AdminEventDetails } from './admin/AdminEventDetails'
import { AdminUsers } from './admin/AdminUsers'
import { Settings as AdminSettings } from './admin/Settings';
import { AdminEventSummary } from './admin/AdminEventSummary';
import { ApiKeys } from "./admin/ApiKeys";
import { AdminRefreshPlayers } from './admin/AdminRefreshPlayers';

import UserAccount from './account/UserAccount'

import Forbidden from './errors/Forbidden'
import { Logout } from './errors/Logout'
import StaffActionCenter from './staff/StaffActionCenter';
import StaffJoinEventInstance from './staff/StaffJoinEventInstance';

const locationHelper = locationHelperBuilder({})

const userIsAuthenticated = connectedRouterRedirect({
    redirectPath: '/login',
    authenticatedSelector: state => state !== null && state.user !== null && state.user.data !== null,
    wrapperDisplayName: 'UserIsAuthenticated'
})

const userIsNotAuthenticated = connectedRouterRedirect({
    redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/',
    allowRedirectBack: false,
    authenticatedSelector: state => state.user.data === null,
    wrapperDisplayName: 'UserIsNotAuthenticated'
})

const PlayerHomeComponent = userIsAuthenticated(AvailableClues);
const PlayerDetailsComponent = userIsAuthenticated(PlayerClueDetails);
const PlayerPlotComponent = userIsAuthenticated(PlayerPlot);
const PlayerPulseComponent = userIsAuthenticated(PlayerPulse);
const PlayerInboxComponent = userIsAuthenticated(PlayerInbox);
const PlayerAchievementComponent = userIsAuthenticated(PlayerAchievements);
const PlayerFeedComponent = userIsAuthenticated(PlayerFeed);
const PlayerChallengesComponent = userIsAuthenticated(PlayerChallenges);
const PlayerChallengeDetailsComponent = userIsAuthenticated(PlayerChallengeDetails);

const StaffCluesComponent = userIsAuthenticated(StaffClues);
const StaffClueDetailsComponent = userIsAuthenticated(StaffClueDetails);
const StaffTeamsComponent = userIsAuthenticated(StaffTeams);
const StaffTeamDetailsComponent = userIsAuthenticated(StaffTeamDetails);
const StaffFeedComponent = userIsAuthenticated(StaffFeed);
const StaffGridComponent = userIsAuthenticated(StaffGrid);
const StaffActionCenterComponent = userIsAuthenticated(StaffActionCenter);
const StaffAchievementsComponent = userIsAuthenticated(StaffAchievements);
const StaffSendMessageComponent = userIsAuthenticated(StaffSendMessage);
const StaffChallengesComponent = userIsAuthenticated(StaffChallenges);
const StaffChallengeDetailsComponent = userIsAuthenticated(StaffChallengeDetails);
const StaffJoinEventInstanceComponent = userIsAuthenticated(StaffJoinEventInstance);

const AdminRefreshComponent = userIsAuthenticated(AdminRefreshPlayers);
const AdminEventsComponent = userIsAuthenticated(AdminEvents);
const AdminEventDetailsComponent = userIsAuthenticated(AdminEventDetails);
const AdminusersComponent = userIsAuthenticated(AdminUsers);
const AdminSettingsComponent = userIsAuthenticated(AdminSettings);
const AdminSummaryComponent = userIsAuthenticated(AdminEventSummary);
const ApiKeysComponent = userIsAuthenticated(ApiKeys);

const LoginComponent = userIsNotAuthenticated(Login);
const LegacyLoginComponent = userIsNotAuthenticated(LegacyLogin);
const UserAccountComponent = userIsAuthenticated(UserAccount);

export default class Routes extends React.Component {
    render() {
        return <div>
            <Route exact path="/" component={Home} />
            <Route path="/login" component={LoginComponent} />
            <Route path="/legacyLogin" component={LegacyLoginComponent} />
            <Route path="/logout" component={Logout} />

            <Route path="/account" component={UserAccountComponent} />

            <Route exact path="/player/home" component={PlayerPlotComponent} />
            <Route exact path="/player/clues" component={PlayerHomeComponent} />
            <Route path="/player/clue/:id" component={PlayerDetailsComponent} />
            <Route path="/player/pulse" component={PlayerPulseComponent} />
            <Route path="/player/messages" component={PlayerInboxComponent} />
            <Route path="/player/achievements" component={PlayerAchievementComponent} />
            <Route path="/player/feed" component={PlayerFeedComponent} />
            <Route exact path="/player/challenges" component={PlayerChallengesComponent} />
            <Route path="/player/challenges/:id" component={PlayerChallengeDetailsComponent} />

            <Route exact path="/staff/clues" component={StaffCluesComponent} />
            <Route exact path="/staff/clues/all" component={StaffCluesComponent} />
            <Route path="/staff/clues/:id/:tab?" component={StaffClueDetailsComponent} />
            <Route path="/staff/joinevent/:name/:id" component={StaffJoinEventInstanceComponent} />
            <Route exact path="/staff/teams" component={StaffTeamsComponent} />
            <Route path="/staff/teams/:id/:tab?" component={StaffTeamDetailsComponent} />
            <Route path="/staff/feed" component={StaffFeedComponent} />
            <Route path="/staff/actioncenter/:fastRefresh?" component={StaffActionCenterComponent} />
            <Route path="/staff/grid" component={StaffGridComponent} />
            <Route path="/staff/achievements" component={StaffAchievementsComponent} />
            <Route path="/staff/messages" component={StaffSendMessageComponent} />
            <Route exact path="/staff/challenges" component={StaffChallengesComponent} />
            <Route path="/staff/challenges/:id" component={StaffChallengeDetailsComponent} />

            <Route exact path="/admin/refresh" component={AdminRefreshComponent} />
            <Route exact path="/admin/events" component={AdminEventsComponent} />
            <Route path="/admin/events/:id" component={AdminEventDetailsComponent} />
            <Route exact path="/admin/users" component={AdminusersComponent} />
            <Route exact path="/admin/settings" component={AdminSettingsComponent} />
            <Route exact path="/admin/keys" component={ApiKeysComponent} />
            <Route path="/admin/summary" component={AdminSummaryComponent} />

            <Route exact path="/forbidden" component={Forbidden} />
        </div>;
    }
}