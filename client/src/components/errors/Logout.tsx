import { Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux';

import { logout } from 'modules/user/service';

export const Logout = () => {
    document.title = "Game Control";
    const dispatch = useDispatch();

    dispatch(logout());
    return (
        <div>
            <Redirect to="/"/>            
            <p>Logging out...</p>
        </div>
    );
}