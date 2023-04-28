import { combineReducers } from 'redux';

import { playerAchievementsReducer } from './achievements/reducer';
import { playerCallsReducer } from "./calls/reducer";
import { playerChallengesReducer } from './challenges/reducer';
import { playerCluesReducer } from './clues/reducer';
import { feedReducer } from './feed/reducer';
import { playerMessagesReducer } from './messages/reducer';
import { teamReducer } from './team/reducer';

export * from "./challenges";
export * from "./clues";
export * from "./feed";
export * from "./messages";

export default combineReducers({
    achievements: playerAchievementsReducer,
    clues: playerCluesReducer,
    calls: playerCallsReducer,
    challenges: playerChallengesReducer,
    feed: feedReducer,
    messages: playerMessagesReducer,
    team: teamReducer
});
