import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { StaffTeam } from 'modules/staff';
import { MessageTemplate } from 'modules/staff/messages';

type Props = Readonly<{
    teams: StaffTeam[];
    disabled: boolean;
    onSubmit: (messageTemplate: MessageTemplate) => void;
}>;

export const SendGcMessageForm = ({ disabled, teams, onSubmit }: Props) => {
    document.title = "Game Control - Send GC Message";

    const [message, setMessage] = useState('');
    const [toTeams, setToTeams] = useState<string[]>([]);

    return (
        <div>
            <Form.Group>
                <Form.Label>Message</Form.Label>
                <Form.Control
                    type="text"
                    value={message}
                    onChange={event => setMessage(event.target.value)}
                    placeholder="Message to send"
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>For Team</Form.Label>
                <Form.Control
                    as="select"
                        onChange={(event: any) => setToTeams([].slice.call(event.target.selectedOptions).map((x: any) => x.value))}
                        multiple
                        style={{height: 300}}>
                    {
                        teams.map(team => <option key={team.teamId} value={team.teamId}>{team.name}</option>)
                    } 
                </Form.Control>
            </Form.Group>
            <Button disabled={disabled} onClick={() => onSubmit({message: message, teams: toTeams})}>Send Message</Button>
        </div>
    );
};