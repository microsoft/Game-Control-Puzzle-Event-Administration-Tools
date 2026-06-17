import React from 'react';

import { xorGuids } from 'modules';
import { useStaffTeamsQuery } from 'modules/staff/teams/queries';

type Props = Readonly<{
    tableOfContentId: string;
}>

export const PuzzlePlayerManifest = ({ tableOfContentId }: Props) => {
    const { data: allTeams = [] } = useStaffTeamsQuery();

    const teams = allTeams.map(t => ({
        teamId: xorGuids(t.teamId, tableOfContentId),
        name: t.name.trim(),
        shortName: t.shortName.trim() ?? t.name.trim(),
        players: t.roster.map(p => ({ id: xorGuids(p.participantId, tableOfContentId) }))
    }));

    return (
        <div>
            <h4>Integration Manifest for Puzzle ID: <code>{tableOfContentId}</code></h4>
            <code>{JSON.stringify(teams)}</code>
        </div>
    );
};
