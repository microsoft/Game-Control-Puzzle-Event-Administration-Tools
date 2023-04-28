import React from 'react';
import { Alert, ListGroup, ListGroupItem, Breadcrumb } from 'react-bootstrap';
import { FaPlus, FaWrench } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';

import DialogRenderProp from './dialogs/DialogRenderProp';
import { TeamForm } from './dialogs';
import { StaffTeam, StaffTeamState, useStaffTeams } from 'modules/staff';

const StaffTeamsList = ({ teams }: { teams: StaffTeamState }) => {
    if (teams.isLoading) {
        return <div>Loading...</div>
    } 
    else if (teams.lastFetched && teams.data.length === 0) {
        return <div>There are currently no teams for this event</div>;
    }
    else if (teams.data !== null) {
        return <ListGroup className="clickable">
                {teams.data.map((team: StaffTeam) => 
                    <LinkContainer key={team.teamId}
                                   to={'/staff/teams/' + team.teamId}>
                        <ListGroupItem key={ team.teamId }>
                            { !!team.isTestTeam && <><FaWrench />&nbsp;</> }
                            { team.name }
                        </ListGroupItem>
                    </LinkContainer>)}
            </ListGroup>
    } else {
        return null;
    }
};

export const StaffTeams = () => {
    const { teams, addOrUpdateTeam } = useStaffTeams();
    document.title = "Game Control - Teams";

    return (
        <div>
              <Breadcrumb>
                    <Breadcrumb.Item>Teams</Breadcrumb.Item>
                </Breadcrumb>
            <h5>
                All Teams
                &nbsp;
                <DialogRenderProp
                    disabled={ teams.isLoading }
                    renderTitle={() => "Add New Team"}
                    renderButton={() => <FaPlus/>}
                    renderBody={(onComplete: () => void) =>
                        <TeamForm                        
                            onSubmit={ addOrUpdateTeam }
                            onComplete = {onComplete}
                        />
                    }
                />
            </h5>
            {
                !!teams.lastError &&
                <Alert variant="danger">{teams.lastError}</Alert>
            }
            <StaffTeamsList teams={teams} />
        </div>
    );
};
