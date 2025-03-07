import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import moment from 'moment';
import { useSelector } from 'react-redux';

import { getChallengePluralNameSetting, getChallengeSingularNameSetting } from 'modules';
import { Challenge } from 'modules/staff/challenges';
import { Module } from 'modules/types';
import { Link } from 'react-router-dom';
import { TanstackTable } from 'components/shared/TanstackTable';
import { useCallback, useMemo } from 'react';

type Props = Readonly<{
    challengesModule: Module<Challenge[]>;
}>;

const ChallengesListTable = ({ challengesModule }: Props) => {
    const challengeSingularName = useSelector(getChallengeSingularNameSetting);

    const columns: ColumnDef<any>[] = [
        {
            id: 'challenges',
            columns: [
                {
                    id: 'title',
                    accessorFn: (row) => row,
                    header: () => <span>{challengeSingularName} Title</span>,
                    cell: (cell) => (
                        <>
                            <Link to={`/staff/challenges/${cell.getValue().challengeId}`}>{cell.getValue().title}</Link>
                            <br />
                            <small>{cell.getValue().description}</small>
                        </>
                    ),
                },
                {
                    id: 'pendingSubmissions',
                    accessorFn: (row) => row.pendingSubmissions,
                    header: () => <span>Pending Submissions</span>,
                },
                {
                    id: 'completedSubmissions',
                    accessorFn: (row) => row.completedSubmissions,
                    header: () => <span>Approved Submissions</span>,
                },
                {
                    id: 'availableAt',
                    accessorFn: (row) => row.availableAt,
                    header: () => <span>Start Time</span>,
                },
                {
                    id: 'locksAt',
                    accessorFn: (row) => row.locksAt,
                    header: () => <span>End Time</span>,
                },
                {
                    id: 'created',
                    accessorFn: (row) => row.created,
                    header: () => <span>Creation Time</span>,
                },
            ],
        },
    ];

    const data = useMemo(
        () =>
            challengesModule.data.map((challenge) => {
                return {
                    ...challenge,
                    availableAt: challenge.startTime ? moment.utc(challenge.startTime).local().format('MM-DD HH:mm') : 'No Start Time',
                    locksAt: challenge.endTime ? moment.utc(challenge.endTime).local().format('MM-DD HH:mm') : 'No End Time',
                    created: moment.utc(challenge.lastUpdated).local().format('MM-DD HH:mm'),
                    pendingSubmissions: challenge.submissions?.filter((x) => x.state === 0).length ?? 0,
                    completedSubmissions: challenge.submissions?.filter((x) => x.state === 1).length ?? 0,
                };
            }),
        [challengesModule]
    );

    const challengesTable = useReactTable({
        data: data,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rowFormatter = (row: any) => (row.getValue('pendingSubmissions') > 0 && { backgroundColor: 'orange' }) || {};

    return <TanstackTable table={challengesTable} rowFormatter={rowFormatter} />;
};

export const ChallengesList = ({ challengesModule }: Props) => {
    const challengePluralName = useSelector(getChallengePluralNameSetting);

    // TODO: Move hook into a sub-component?
    if (!challengesModule.isLoading && challengesModule.data.length === 0) {
        return <div>There are no {challengePluralName} for this event</div>;
    } else {
        return <ChallengesListTable challengesModule={challengesModule} />;
    }
};
