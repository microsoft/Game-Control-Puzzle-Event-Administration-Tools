import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';

import { forceRefreshPlayers, forceRefreshStaff } from 'modules/admin/events/service';

export const AdminRefreshPlayers = () => {
    const dispatch = useDispatch();

    return(
        <div>
            <Button onClick={() => dispatch(forceRefreshStaff())}>Refresh Staff</Button>
            <Button onClick={() => dispatch(forceRefreshPlayers())}>Refresh Players</Button>
        </div>);
};
