export const APPLICATION_URL = process.env.REACT_APP_GAMECONTROL_CLIENT_API_URL;

export const STAFFCLUES_FETCHING = 'STAFFCLUES_FETCHING';
export const STAFFCLUES_FETCHED  = 'STAFFCLUES_FETCHED';
export const STAFFCLUES_FAILED   = 'STAFFCLUES_FAILED';
export const STAFFCLUES_ADDED    = 'STAFFCLUES_ADDED';

export const ADD_ANSWER_STARTED  = 'ADD_ANSWER_STARTED';
export const ADD_ANSWER_FAILED   = 'ADD_ANSWER_FAILED';
export const ADD_ANSWER_FINISHED = 'ADD_ANSWER_FINISHED';

export const STAFFDETAILS_FETCHING = 'STAFFDETAILS_FETCHING';
export const STAFFDETAILS_FETCHED  = 'STAFFDETAILS_FETCHED';
export const STAFFDETAILS_FAILED   = 'STAFFDETAILS_FAILED';

// TODO: Can create and update be used together? What will that mean for
// the reducer? 
export const STAFFCREATECLUE_PUTTING = 'STAFFCREATECLUE_PUTTING';
export const STAFFCREATECLUE_FETCHED = 'STAFFCREATECLUE_FETCHED';
export const STAFFCREATECLUE_FAILED  = 'STAFFCREATECLUE_FAILED';