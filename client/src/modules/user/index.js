import axios from "axios";
import * as actions from "./actions";

export const initialUserState = {
    data: null,
    errorMessage: null,
    isLoading: false,
    eventName: 'Game Control',
    eventId: null,
    eventSettings: [],
    teamId: null,
    isStaff: false,
    isAdmin: false,
    isVirtual: false,
    teamName: undefined,
    teamShortName: undefined
};

export const userReducer = (state = initialUserState, { type, payload, additionalInformation}) => {
    switch (type) {
      case actions.USER_LOGIN_STARTED:
        return { ...initialUserState, isLoading: true, errorMessage: null }
      case actions.USER_LOGIN_FAILED:
        return { ...initialUserState, isLoading: false, errorMessage: payload, additionalInformation}
      case actions.USER_LOGIN_FINISHED:
        let defaultEventName = 'Game Control';
        let defaultEventId = null;
        let defaultEventSettings = [];
        let isStaff = false;
        let isAdmin = false;
        let teamId = null;
        let teamName = undefined;
        let teamShortName = undefined;

        if (payload !== null) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${payload.token}`;

          if (payload.participation !== null && payload.participation.length > 0) {
            const targetEvent = payload.participation[payload.participation.length - 1]; 

            defaultEventName = targetEvent.eventFriendlyName;
            defaultEventId   = targetEvent.eventInstanceId;
            defaultEventSettings = targetEvent.settings;
            isStaff = targetEvent.isStaff;
            isAdmin = targetEvent.isAdmin;
            teamId = targetEvent.teamId;
            teamName = targetEvent.teamName;
            teamShortName = targetEvent.teamShortName;
          }
        }
                  
        return { ...state, 
          data: payload,
          eventName: defaultEventName, 
          eventId: defaultEventId, 
          eventSettings: defaultEventSettings,
          isStaff,
          isAdmin,
          teamId,
          teamName, 
          teamShortName,
          isLoading: false,
          errorMessage: null 
        };
      case actions.USER_LOGGED_OUT:
        axios.defaults.headers.common['Authorization'] = undefined;
        return initialUserState
      default:
        return state
    }
}