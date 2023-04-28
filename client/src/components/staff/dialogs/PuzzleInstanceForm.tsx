import { StaffTeam } from 'modules/staff';
import { ClueInstance, ClueInstanceTemplate } from 'modules/staff/clues';
import React, { useState } from 'react';
import { Form, FormGroup, Button} from 'react-bootstrap';

type Props = Readonly<{
    currentInstance?: ClueInstance;
    onUpdate: (template: ClueInstanceTemplate) => void;
    allTeams: StaffTeam[]
}>;

export const PuzzleInstanceForm = ({ currentInstance, onUpdate, allTeams }: Props) => {
    const [id] = useState(currentInstance?.id ?? undefined);
    const [needsReset, setNeedsReset] = useState(currentInstance?.needsReset ?? false);
    const [currentTeam, setCurrentTeam] = useState(currentInstance?.currentTeam ?? '');
    const [friendlyName, setFriendlyName] = useState(currentInstance?.friendlyName ?? '');
    const [notes, setNotes] = useState(currentInstance?.notes ?? '');

    return (
        <div>
            <FormGroup>
                <Form.Label>Current Team</Form.Label>
                <Form.Control as="select"
                             onChange={event => setCurrentTeam(event.target.value)}
                             value={currentTeam}>
                    {
                        !!allTeams ?
                        <>
                            <option key={'none'} value={''}>No Team</option>
                            {allTeams.map(team => <option key={team.teamId} value={team.teamId}>{team.name}</option>)}
                        </> :
                        ''
                    }
                </Form.Control>
            </FormGroup>
            <FormGroup>
                <Form.Check type="checkbox" checked={!needsReset}
                          onChange={(event: any) => setNeedsReset(!event.target.checked)}
                    label="Is Available"
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Instance Name</Form.Label>
                <Form.Control type="text"
                             value={friendlyName}
                             placeholder="Optional name for the instance"
                             onChange={event => setFriendlyName(event.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Instance Notes</Form.Label>
                <Form.Control type="text"
                             value={notes}
                             placeholder="Optional notes for the instance"
                             onChange={event => setNotes(event.target.value)}
                />
            </FormGroup>

            <Button onClick={() => onUpdate(
                { 
                    id,
                    currentTeam,
                    friendlyName,
                    needsReset,
                    notes
                }
            )}>
                Save
            </Button>
        </div>
    );
};