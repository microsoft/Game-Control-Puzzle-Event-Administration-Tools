import { NavLink, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUser } from 'modules';

export const Home = () => {
    const user = useSelector(getUser);

    return (
        <div>
            <h1 className="m-4">Welcome</h1>
            <p>
                <NavLink to="/login">Login</NavLink>
            </p>

            <div>{user !== undefined && user.data !== null ? user.isStaff ? <Redirect to="/staff/clues" /> : <Redirect to="/player/home" /> : <Redirect to="/login" />}</div>
        </div>
    );
};
