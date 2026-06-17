import React from 'react';
import { Alert, ListGroup, ListGroupItem, Breadcrumb } from 'react-bootstrap';
import { FaPlus, FaWrench } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';

import DialogRenderProp from './dialogs/DialogRenderProp';
import { TeamForm } from './dialogs';
import { StaffTeam } from 'modules/staff';
import { useAddOrUpdateTeamMutation, useStaffTeamsQuery } from 'modules/staff/teams/queries';
import { getErrorMessage } from 'lib/apiFetch';

const StaffTeamsList = ({ teams, isLoaded }: { teams: StaffTeam[]; isLoaded: boolean }) => {
    if (isLoaded && teams.length === 0) {
        return <div>There are currently no teams for this event</div>;
    }

    return (
        <ListGroup className="clickable">
            {teams.map((team: StaffTeam) => (
                <LinkContainer key={team.teamId} to={'/staff/teams/' + team.teamId}>
                    <ListGroupItem key={team.teamId}>
                        {!!team.isTestTeam && <><FaWrench />&nbsp;</>}
                        {team.name}
                    </ListGroupItem>
                </LinkContainer>
            ))}
        </ListGroup>
    );
};

export const StaffTeams = () => {
    const { data: teams = [], isLoading, isSuccess, error } = useStaffTeamsQuery();
    const addOrUpdateTeam = useAddOrUpdateTeamMutation();
    document.title = 'Game Control - Teams';

    return (
        <div>
            <Breadcrumb>
                <Breadcrumb.Item>Teams</Breadcrumb.Item>
            </Breadcrumb>
            <h5>
                All Teams
                &nbsp;
                <DialogRenderProp
                    disabled={isLoading}
                    renderTitle={() => 'Add New Team'}
                    renderButton={() => <FaPlus />}
                    renderBody={(onComplete: () => void) => (
                        <TeamForm
                            onSubmit={(template) => addOrUpdateTeam.mutate(template, { onSuccess: onComplete })}
                            onComplete={onComplete}
                        />
                    )}
                />
            </h5>
            {isLoading && teams.length === 0 && <div>Loading...</div>}
            {!!error && <Alert variant="danger">{getErrorMessage(error)}</Alert>}
            {!!addOrUpdateTeam.error && <Alert variant="danger">{getErrorMessage(addOrUpdateTeam.error)}</Alert>}
            <StaffTeamsList teams={teams} isLoaded={isSuccess} />
        </div>
    );
};
