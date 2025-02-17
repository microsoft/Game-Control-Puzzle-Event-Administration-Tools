import * as Msal from 'msal';

type ApplicationConfig = Readonly<{
    clientId: string | undefined;
    graphScopes: string[];
}>;

type IdToken = Readonly<{
    preferred_username: string;
    oid: string;
}>;

export default class AuthService {
    private readonly app: Msal.UserAgentApplication;
    private readonly isMicrosoftAccountValid: boolean;
    private readonly applicationConfig: ApplicationConfig;

    constructor() {
        this.applicationConfig = {
            clientId: process.env.REACT_APP_MICROSOFT_ACCOUNT_CLIENT_ID,
            graphScopes: ['user.read'],
        };

        this.isMicrosoftAccountValid = !!this.applicationConfig.clientId;
        this.app = new Msal.UserAgentApplication(this.applicationConfig.clientId!, null, () => {}, {
            redirectUri: window.location.origin + '/login',
        });
    }

    login = () => {
        return this.app.loginPopup(this.applicationConfig.graphScopes).then(
            (idToken) => {
                const user = this.app.getUser();
                if (user) {
                    return { token: idToken, oid: (user.idToken as IdToken).oid, preferred_username: (user.idToken as IdToken).preferred_username };
                } else {
                    return null;
                }
            },
            () => {
                return null;
            }
        );
    };

    logout = () => {
        this.app.logout();
    };

    getToken = () => {
        return this.app.acquireTokenSilent(this.applicationConfig.graphScopes).then(
            (accessToken) => {
                return accessToken;
            },
            (error) => {
                return this.app.acquireTokenPopup(this.applicationConfig.graphScopes).then(
                    (accessToken) => {
                        return accessToken;
                    },
                    (err) => {
                        console.error(err);
                    }
                );
            }
        );
    };
}
