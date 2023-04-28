import React, { useState } from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';

import { Participation, ParticipationTemplate } from 'modules/admin/models';
import { StaffTeam } from 'modules/staff/teams/models';

type Props = Readonly<{
    teams: StaffTeam[];
    participation?: Participation;
    onSubmit: (participation: ParticipationTemplate) => void;
    onComplete: () => void;
}>;

export const EditParticipationForm = ({ teams, participation, onSubmit, onComplete }: Props) => {
    const [isStaff, setIsStaff] = useState(participation?.isStaff ?? false);
    const [isAdmin, setIsAdmin] = useState(participation?.isAdmin ?? false);
    const [teamId, setTeamId] = useState<string | undefined>(participation?.teamId);

    const selectedTeam = teams.length > 0 ? teams.find(x => x.teamId === teamId) ?
        teams.find(x => x.teamId === teamId)?.teamId :
        teams[0].teamId : undefined;

    return (
        <>
            <FormGroup>
                <Form.Check type="checkbox"
                            checked={isStaff}
                            onChange={(event: any) => setIsStaff(event.target.checked)}
                            label="Is Staff"
                />
                <Form.Check type="checkbox"
                            checked={isAdmin}
                            onChange={(event: any) => setIsAdmin(event.target.checked)}
                            label="Is IsAdmin"
                />      
            </FormGroup>
            <FormGroup>
                <Form.Check type="checkbox" 
                            label="Is On Team"
                            checked={!!teamId}
                            disabled={teams.length === 0}
                            onChange={(event: any) => {
                                if (event.target.checked) {
                                    setTeamId(teams[0].teamId);
                                } else {
                                    setTeamId(undefined);
                                }
                            }}
                />
                <Form.Label>Team Membership</Form.Label>
                <Form.Control as="select"
                              disabled={teams.length === 0}
                              value={selectedTeam}
                              onChange={(event: any) => setTeamId(event.target.value)} 
                >
                        {teams.map(team => 
                            <option key={team.teamId} value={team.teamId}>
                                {team.name}
                            </option>
                        )}
                </Form.Control>
            </FormGroup>
            <Button 
                disabled={!isStaff && !teamId}            
                onClick={() => {
                    onSubmit({ isStaff, isAdmin, teamId });
                    onComplete();
            }}>
                { participation ? "Update Role" : "Add To Event" }
            </Button>
        </>
    );
}