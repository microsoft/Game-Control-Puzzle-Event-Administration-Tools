import { useSelector } from 'react-redux';

import { getEventInstanceId } from 'modules/user/selectors';

/**
 * Reads the current eventInstanceId from Redux state.
 * Once the user module is migrated to React Context this can be
 * updated in a single place.
 */
export const useEventInstanceId = () => useSelector(getEventInstanceId) as string;
