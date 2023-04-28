import React from 'react';
import { useSelector } from 'react-redux';

import { xorGuids } from 'modules';
import { getStaffTeams } from 'modules/staff';

type Props = Readonly<{
    tableOfContentId: string;
}>

export const PuzzlePlayerManifest = ({ tableOfContentId }: Props) => {
    const allTeams = useSelector(getStaffTeams);

    const teams = allTeams.data.map(t => ({
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
