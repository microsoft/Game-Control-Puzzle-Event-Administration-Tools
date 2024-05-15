import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Alert, Button, Form, FormGroup, Card } from 'react-bootstrap';
import { getUser } from 'modules';
import { loginUserName } from 'modules/user/service';

// Useful link:
// https://github.com/joshgeller/react-redux-jwt-auth-example/blob/3567c995a57a616489be3f44e7dbca74db5144cd/src/actions/index.js

export const LegacyLogin = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const user = useSelector(getUser);
    const dispatch = useDispatch();

    const handleSubmit = (event: any) => {
        event.preventDefault();
        dispatch(loginUserName(login, password));
    }

    return (
        <div className="w-100">
            {
                !!user.errorMessage &&
                <Alert variant="danger">{user.errorMessage}</Alert>
            }
            <div className="d-flex w-100 justify-content-center">
                <Card className="" style={{ maxWidth: '650px', flex: 1 }}>
                    <Card.Body>
                        <Card.Title>Log In</Card.Title>

                        <Form
                            onSubmit={handleSubmit}>
                            <FormGroup>
                                <Form.Label>User Name</Form.Label>
                                <Form.Control type="text"
                                    placeholder="User Name"
                                    value={login}
                                    onChange={event => setLogin(event.target.value)}
                                    disabled={user.isLoading} />
                            </FormGroup>
                            <FormGroup>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={event => setPassword(event.target.value)}
                                    disabled={user.isLoading} />
                            </FormGroup>
                            <FormGroup>
                                <Button disabled={user.isLoading}
                                    type="submit">
                                    Log In
                                </Button>
                            </FormGroup>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};