import moment from 'moment';
import 'moment-timezone';

import { StaffCluesState } from './clues/staffCluesModule';

export * from './grid';
export * from './teams';
export * from './clues/comparators';
export * from './achievements/comparators';
export { isContentEqual } from 'modules/types/comparators';

export const getCluesModule = (state: any) => {
    return state.staffClues;
};

export function shouldRefreshClues(staffCluesModule: StaffCluesState) {
    return !staffCluesModule.lastFetched || moment.utc().diff(staffCluesModule.lastFetched, 'seconds') > 15;
}
