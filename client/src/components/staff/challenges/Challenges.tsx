import moment from 'moment';
import { Alert } from 'react-bootstrap';
import BootstrapTable, { ColumnDescription } from 'react-bootstrap-table-next';
import { FaPlus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import DialogRenderProp from '../dialogs/DialogRenderProp';
import { ChallengeForm } from '../dialogs/ChallengeForm';
import { Challenge, useStaffChallenges } from 'modules/staff/challenges';
import { Module } from 'modules/types';
import { getChallengePluralNameSetting, getChallengeSingularNameSetting, getPointsNameSetting } from 'modules';

import { ChallengesList as TanstackList } from './components/ChallengesList';

const ChallengesList = ({ challengesModule }: { challengesModule: Module<Challenge[]> }) => {
    const challengePluralName = useSelector(getChallengePluralNameSetting);
    const challengeSingularName = useSelector(getChallengeSingularNameSetting);

    if (!challengesModule.isLoading && challengesModule.data.length === 0) {
        return <div>There are no {challengePluralName} for this event</div>;
    } else {
        let data = challengesModule.data.map((challenge) => {
            return {
                ...challenge,
                availableAt: challenge.startTime ? moment.utc(challenge.startTime).local().format('MM-DD HH:mm') : 'No Start Time',
                locksAt: challenge.endTime ? moment.utc(challenge.endTime).local().format('MM-DD HH:mm') : 'No End Time',
                created: moment.utc(challenge.lastUpdated).local().format('MM-DD HH:mm'),
                pendingSubmissions: challenge.submissions?.filter((x) => x.state === 0).length ?? 0,
                completedSubmissions: challenge.submissions?.filter((x) => x.state === 1).length ?? 0,
            };
        });

        const columns: ColumnDescription[] = [
            {
                dataField: 'title',
                text: `${challengeSingularName} Title`,
                formatter: (cell: any, row: any) => (
                    <>
                        <Link to={`/staff/challenges/${row.challengeId}`}>{cell}</Link>
                        <br />
                        <small>{row.description}</small>
                    </>
                ),
                sort: true,
            },
            {
                dataField: 'pendingSubmissions',
                text: 'Pending Submissions',
                sort: true,
            },
            {
                dataField: 'completedSubmissions',
                text: 'Approved Submissions',
                sort: true,
            },
            {
                dataField: 'availableAt',
                text: 'Start Time',
                sort: true,
            },
            {
                dataField: 'locksAt',
                text: 'End Time',
                sort: true,
            },
            {
                dataField: 'created',
                text: 'Creation Time',
                sort: true,
            },
        ];

        const rowFormatter = (row: any, rowIndex: number) => (row.pendingSubmissions > 0 && { backgroundColor: 'orange' }) || {};

        return <BootstrapTable columns={columns} data={data} keyField="challengeId" defaultSorted={[{ dataField: 'pendingSubmissions', order: 'desc' }]} rowStyle={rowFormatter} />;
    }
};

export const Challenges = () => {
    const challengePluralName = useSelector(getChallengePluralNameSetting);
    const challengeSingularName = useSelector(getChallengeSingularNameSetting);
    const pointsNameSetting = useSelector(getPointsNameSetting);
    const { challengesModule, addChallenge } = useStaffChallenges();

    document.title = `Game Control - ${challengePluralName}`;

    return (
        <div>
            <h5>
                {challengePluralName}
                &nbsp;
                <DialogRenderProp
                    renderTitle={() => `Add New ${challengeSingularName}`}
                    renderButton={() => <FaPlus />}
                    renderBody={(onComplete: any) => <ChallengeForm pointsName={pointsNameSetting} onSubmit={addChallenge} onComplete={onComplete} />}
                />
            </h5>

            {!!challengesModule.lastError && <Alert variant="danger">{challengesModule.lastError}</Alert>}

            {!!challengesModule.isLoading && <Alert variant="info">Loading...</Alert>}

            <ChallengesList challengesModule={challengesModule} />

            <TanstackList challengesModule={challengesModule} addChallenge={addChallenge} />
        </div>
    );
};
