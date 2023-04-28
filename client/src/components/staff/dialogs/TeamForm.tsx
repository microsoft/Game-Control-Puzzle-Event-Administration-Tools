import React, { useState } from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';

import { StaffTeam, TeamTemplate } from 'modules/staff/teams/models';

type Props = Readonly<{
    team?: StaffTeam;
    onSubmit: (template: TeamTemplate) => void;
    onComplete: () => void;
}>;

export const TeamForm = ({ team, onSubmit, onComplete }: Props) => {
    const [teamId] = useState(team?.teamId ?? undefined);
    const [name, setName] = useState(team?.name ?? '');
    const [shortName, setShortName] = useState(team?.shortName ?? '');
    const [color, setColor] = useState<string>(team?.color.toString() ?? "0");
    const [passphrase, setPassphrase] = useState(team?.passphrase ?? '');
    const [isTestTeam, setIsTestTeam] = useState(team?.isTestTeam ?? false);
    const [gcNotes, setGcNotes] = useState(team?.gcNotes ?? '');

    const isNameInvalid = () => name.length === 0;
    const isColorInvalid = () => isNaN(parseInt(color));

    return (
        <>
            <FormGroup>
                <Form.Label>Name</Form.Label>
                <Form.Control type="text"
                            required
                            value={name}
                            isInvalid={isNameInvalid()}
                            placeholder="Team Name"
                            onChange={event => setName(event.target.value)}/>
                <Form.Control.Feedback type="invalid">A name is required</Form.Control.Feedback>
            </FormGroup>
            <FormGroup>
                <Form.Label>Short Name</Form.Label>
                <Form.Control type="text"
                            value={shortName}
                            placeholder="Team Short Name"
                            onChange={event => setShortName(event.target.value)}/>
            </FormGroup>
            <FormGroup>
                <Form.Label>Color</Form.Label>
                <Form.Control type="text"
                            value={color}
                            isValid={!isNaN(parseInt(color))}
                            isInvalid={isColorInvalid()}
                            placeholder="Team Color"
                            onChange={event => setColor(event.target.value)}
                />                            
                <Form.Control.Feedback type="invalid">Color must be an integer number</Form.Control.Feedback>
            </FormGroup>
            <FormGroup>
                <Form.Label>Passphrase</Form.Label>
                <Form.Control type="text"
                            value={passphrase}
                            placeholder="Passphrase"
                            onChange={event => setPassphrase(event.target.value)}/>
            </FormGroup>
            <FormGroup>
                <Form.Label>GC Notes</Form.Label>
                <Form.Control type="text"
                            value={gcNotes}
                            placeholder="GC Notes"
                            onChange={event => setGcNotes(event.target.value)}/>
            </FormGroup>
            <FormGroup>
                <Form.Check type="checkbox" checked={isTestTeam}
                    onChange={(event: any) => setIsTestTeam(event.target.checked)}
                label="Is Test Team?"/>
            </FormGroup>
            <Button
                disabled={isNameInvalid() || isColorInvalid()}
                onClick={() => {
                    onSubmit({teamId, name, shortName, color: parseInt(color), passphrase, isTestTeam, gcNotes});
                    onComplete();
            }}>{team ? 'Update' : 'Add'}</Button>
        </>
    );
}