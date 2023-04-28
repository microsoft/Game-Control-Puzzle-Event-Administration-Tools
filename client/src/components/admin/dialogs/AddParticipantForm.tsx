import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { StaffTeam } from 'modules/staff';
import { NewParticipantTemplate } from 'modules/admin/users';

type Props = Readonly<{
    teams: StaffTeam[];
    onSubmit: (participant: NewParticipantTemplate) => void;
    onComplete: () => void;
}>;

export const AddParticipantForm = ({ teams, onSubmit, onComplete }: Props) => {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [isStaff, setIsStaff] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [teamId, setTeamId] = useState<string | undefined>(undefined);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const selectedTeam = teams.length > 0 ? teams.find(x => x.teamId === teamId) ?
        teams.find(x => x.teamId === teamId)?.teamId :
        teams[0].teamId : undefined;

    const isFormValid = () =>
        displayName.length > 0 &&
        (((isStaff || isAdmin) && !teamId) ||
            (!isStaff && !isAdmin && !!teamId));

    return (
        <>
            <Form.Group>
                <Form.Label>Display Name</Form.Label>
                <Form.Control
                    type="text"
                    value={displayName}
                    placeholder="The user's full name"
                    onChange={event => setDisplayName(event.target.value)}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="text"
                    value={email}
                    placeholder="E-mail address"
                    onChange={event => setEmail(event.target.value)}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Contact Number</Form.Label>
                <Form.Control
                    type="text"
                    value={contactNumber}
                    placeholder="Contact Number"
                    onChange={event => setContactNumber(event.target.value)}
                />
            </Form.Group>
            <Form.Group>
                <Form.Check
                    type="checkbox"
                    checked={isStaff}
                    disabled={!!teamId}
                    onChange={(event: any) => setIsStaff(event.target.checked)}
                    label="Is Staff"
                />
                <Form.Check
                    type="checkbox"
                    checked={isAdmin}
                    disabled={!!teamId}
                    onChange={(event: any) => setIsAdmin(event.target.checked)}
                    label="Is IsAdmin"
                />
            </Form.Group>
            <Form.Group>
                <Form.Check type="checkbox" 
                            label="Is On Team"
                            checked={!!teamId}
                            disabled={teams.length === 0 || isStaff || isAdmin}
                            onChange={(event: any) => {
                                if (event.target.checked) {
                                    setTeamId(teams[0].teamId);
                                } else {
                                    setTeamId(undefined);
                                }
                            }}
                />
                <Form.Label>Team Membership</Form.Label>
                <Form.Control
                    as="select"
                    disabled={teams.length === 0 || isStaff || isAdmin}
                    value={selectedTeam}
                    onChange={event => setTeamId(event.target.value)}
                >
                        {teams.map(team => 
                            <option key={team.teamId} value={team.teamId}>
                                {team.name}
                            </option>
                        )}
                </Form.Control>
            </Form.Group>
            
            <Form.Group>
                <Form.Label>Login</Form.Label>
                <Form.Control
                    type="text"
                    value={login}
                    placeholder="Login"
                    onChange={event => setLogin(event.target.value)}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="text"
                    value={password}
                    placeholder="Password"
                    onChange={event => setPassword(event.target.value)}
                />
            </Form.Group>

            <Button
                disabled={!isFormValid()}
                onClick={() => {
                    onSubmit({
                        firstName: displayName,
                        lastName: '',
                        email,
                        contactNumber,
                        teamId,
                        isStaff,
                        isAdmin,
                        login,
                        password
                    });
                    onComplete();
                }}
            >
                Add
            </Button>
        </>
    );
}