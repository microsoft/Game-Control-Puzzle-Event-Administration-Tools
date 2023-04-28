import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

import AuthService from './MicrosoftAuthService'
import { loadUserTokenFromCache, loginMsaToken } from 'modules/user/service';
import MicrosoftLoginLogo from './components/user/mslogin.svg'

const authService = new AuthService();

export const Login = () => {
    const user = useSelector((state: any) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadUserTokenFromCache());
    }, [dispatch]);

    const doMSALogin = async () => {
        try {
            const signedInUser = await authService.login();
            if (signedInUser) {
                dispatch(loginMsaToken(signedInUser));
            } else {
                // User abandoned sign in.
            }
        } catch (e) {
            // Sign in failed. We'll catch the error but there is nothing
            // for us to do here.
        }
    }

    return (
        <div>
            <h1 className="m-4">Welcome</h1>
            {
                !!user.errorMessage &&
                <Alert variant="danger">
                    <h3>{user.errorMessage}</h3>
                    <small>Please provide this information to Game Control to help us get you connected:<br/> {user.additionalInformation}</small>
                </Alert>
            }
            <Button variant="outline-dark" disabled={user.isLoading} onClick={doMSALogin}><img src={MicrosoftLoginLogo} alt="Log in with a Microsoft Account"/></Button>

            <p>
                <LinkContainer to="/legacyLogin">
                    <Button variant="link">Log in with legacy account</Button>
                </LinkContainer>
            </p>
        </div>
    );
};