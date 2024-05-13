import { ChallengesNamePluralSetting, ChallengesNameSingularSetting, PointsNameSetting, ShowAchievementsSetting, ShowActivitySetting, ShowChallengesSetting, ShowInboxSetting, ShowPulseSetting } from "modules/types/constants";

export const getUser = (state: any) => state.user;

export const getIsUserSignedIn = (state: any) => !!getUser(state).data;

export const getUserToken = (state: any) => getUser(state).data?.token;

export const getEventInstanceId = (state: any) => getUser(state).eventId;

export const getEventName = (state: any) => getUser(state).eventName;

export const getUserName = (state: any) => getUser(state).data?.displayName ?? '';

export const getIsUserOnTeam = (state: any) => getUser(state)?.teamId ?? false;

export const getIsUserStaff = (state: any) => getUser(state)?.isStaff ?? false;

export const getIsUserAdmin = (state: any) => getUser(state)?.isAdmin ?? false;

export const getParticipantId = (state: any) => getUser(state).data.participantId;

export const getChallengeSingularNameSetting = (state: any) => 
    getUser(state).eventSettings.find((x: any) => x.name === ChallengesNameSingularSetting)?.stringValue || "Challenge";

export const getChallengePluralNameSetting = (state: any) =>
    (getUser(state).eventSettings.find((x: any) => x.name === ChallengesNamePluralSetting)?.stringValue) || "Challenges";

export const getPointsNameSetting = (state: any) => 
    getUser(state).eventSettings.find((x: any) => x.name === PointsNameSetting)?.stringValue || "Points";

export const getShowPulseSetting = (state:any) => getBooleanSetting(state, ShowPulseSetting);
export const getShowInboxSetting = (state:any) => getBooleanSetting(state, ShowInboxSetting);
export const getShowActivitySetting = (state:any) => getBooleanSetting(state, ShowActivitySetting);
export const getShowAchievementsSetting = (state:any) => getBooleanSetting(state, ShowAchievementsSetting);
export const getShowChallengesSetting = (state:any) => getBooleanSetting(state, ShowChallengesSetting);

function getBooleanSetting (state: any, settingName: string)
{
    const setting = getUser(state).eventSettings.find((x: any) => x.name === settingName);
    
    const stringValue = setting?.stringValue;
    
    if (stringValue === null || stringValue === undefined)
    {
        return true;
    }
    
    return (stringValue === "true");
};