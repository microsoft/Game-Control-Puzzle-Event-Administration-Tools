import { combineReducers } from 'redux';
import * as moment from 'moment';

import { achievementsReducer, teamAchievementsReducer } from './achievements/reducer';

import { feedReducer } from './feed/reducer';
import { gridReducer } from './grid/staffGridModule';
import { challengesReducer } from './challenges/reducer';
import { messagesReducer } from './messages/messagesModule';
import { staffTeamsReducer } from './teams/staffTeamsModule';
import { StaffCluesState } from './clues/staffCluesModule';
import { Answer, StaffClue } from './clues';
import { Achievement, Content } from 'modules/types';

export * from './grid';
export * from './teams';
export * from './challenges/hooks';

export default combineReducers({
    achievements: achievementsReducer,
    teamAchievements: teamAchievementsReducer,
    feed: feedReducer,
    grid: gridReducer,
    challenges: challengesReducer,
    messages: messagesReducer,
    teams: staffTeamsReducer,
});

export const getFeedModule = (state: any) => {
    return state.staff.feed;
};

export const getCluesModule = (state: any) => {
    return state.staffClues;
};

export const getTeamAchievementsModule = (state: any) => state.staff.teamAchievements;

export function shouldRefreshClues(staffCluesModule: StaffCluesState) {
    return !staffCluesModule.lastFetched || moment.utc().diff(staffCluesModule.lastFetched, 'seconds') > 15;
}

export const areCluesEqual = (clue1: StaffClue, clue2: StaffClue) => {
    if (clue1 == null || clue2 == null) {
        if (clue1 == null && clue2 == null) {
            return true;
        }
        return false;
    }

    if (clue1.shortTitle !== clue2.shortTitle) {
        return false;
    }
    if (clue1.sortOrder !== clue2.sortOrder) {
        return false;
    }
    if (clue1.submittableId !== clue2.submittableId) {
        return false;
    }
    if (clue1.submittableType !== clue2.submittableType) {
        return false;
    }
    if (clue1.tableOfContentId !== clue2.tableOfContentId) {
        return false;
    }
    if (clue1.submittableTitle !== clue2.submittableTitle) {
        return false;
    }

    return true;
};

export const compareClues = (clue1: StaffClue, clue2: StaffClue) => {
    if (clue1.sortOrder < clue2.sortOrder) {
        return -1;
    }

    if (clue1.sortOrder > clue2.sortOrder) {
        return 1;
    }

    const submittableIdCompare = clue1.submittableId.localeCompare(clue2.submittableId);
    if (submittableIdCompare !== 0) {
        return submittableIdCompare;
    }

    return 0;
};

export const compareAchievements = (achievement1: Achievement, achievement2: Achievement) => {
    const compareResult = achievement1.achievementId.localeCompare(achievement2.achievementId);
    if (compareResult !== 0) {
        return compareResult;
    }

    return 0;
};

export const areAchievementsEqual = (achievement1: Achievement, achievement2: Achievement) => {
    if (achievement1 == null || achievement2 == null) {
        if (achievement1 == null && achievement2 == null) {
            return true;
        }
        return false;
    }

    if (achievement1.achievementId !== achievement2.achievementId) {
        return false;
    }
    if (achievement1.description !== achievement2.description) {
        return false;
    }
    if (achievement1.lastUpdated !== achievement2.lastUpdated) {
        return false;
    }
    if (achievement1.name !== achievement2.name) {
        return false;
    }

    return true;
};

export const isContentEqual = (content1: Content, content2: Content) => {
    if (content1 == null || content2 == null) {
        if (content1 == null && content2 == null) {
            return true;
        }
        return false;
    }

    if (content1.address !== content2.address) {
        return false;
    }
    if (content1.contentId !== content2.contentId) {
        return false;
    }
    if (content1.contentType !== content2.contentType) {
        return false;
    }
    if (content1.latitude !== content2.latitude) {
        return false;
    }
    if (content1.locationFlags !== content2.locationFlags) {
        return false;
    }
    if (content1.longitude !== content2.longitude) {
        return false;
    }
    if (content1.name !== content2.name) {
        return false;
    }
    if (content1.stringContent !== content2.stringContent) {
        return false;
    }

    return true;
};

export const areAnswersEqual = (answer1: Answer, answer2: Answer) => {
    if (answer1 == null || answer2 == null) {
        if (answer1 == null && answer2 == null) {
            return true;
        }
        return false;
    }

    if (answer1.unlockedClues.length !== answer2.unlockedClues.length) {
        return false;
    }

    let clueArray1 = answer1.unlockedClues.slice();
    clueArray1.sort(compareClues);
    let clueArray2 = answer2.unlockedClues.slice();
    clueArray2.sort(compareClues);
    for (var i = 0; i < clueArray1.length; i++) {
        if (!areCluesEqual(clueArray1[i], clueArray2[i])) {
            return false;
        }
    }

    if (answer1.unlockedAchievements.length !== answer2.unlockedAchievements.length) {
        return false;
    }

    let achArray1 = answer1.unlockedAchievements.slice();
    achArray1.sort(compareAchievements);
    let achArray2 = answer2.unlockedAchievements.slice();
    achArray2.sort(compareAchievements);
    for (var j = 0; j < achArray1.length; j++) {
        if (!areAchievementsEqual(achArray1[j], achArray2[j])) {
            return false;
        }
    }

    if (answer1.additionalContent === undefined || answer2.additionalContent === undefined) {
        if (!(answer1.additionalContent === undefined && answer2.additionalContent === undefined)) {
            return false;
        }
    } else if (!isContentEqual(answer1.additionalContent, answer2.additionalContent)) {
        return false;
    }

    if (answer1.answerResponse !== answer2.answerResponse) {
        return false;
    }
    if (answer1.answerText !== answer2.answerText) {
        return false;
    }
    if (answer1.isCorrectAnswer !== answer2.isCorrectAnswer) {
        return false;
    }

    return true;
};

export const compareAnswers = (answer1: Answer, answer2: Answer) => {
    const compareTextResult = answer1.answerText.localeCompare(answer2.answerText);
    if (compareTextResult !== 0) {
        return compareTextResult;
    }

    if (answer1.teamId !== undefined && answer2.teamId !== undefined) {
        const compareTeamIdResult = answer1.teamId.localeCompare(answer2.teamId);
        if (compareTeamIdResult !== 0) {
            return compareTeamIdResult;
        }
    }

    const compareIdResult = answer1.answerId.localeCompare(answer2.answerId);
    if (compareIdResult !== 0) {
        return compareIdResult;
    }

    return 0;
};
