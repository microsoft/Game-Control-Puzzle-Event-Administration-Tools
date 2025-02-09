import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Alert, Card, CardDeck, Spinner, DropdownButton, Dropdown, Badge } from 'react-bootstrap';
import { FiMessageCircle } from 'react-icons/fi';
import { FaRegClock, FaPuzzlePiece } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';
import { MdContactPhone } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import * as moment from 'moment';
import _ from 'lodash';

import { useStaffGridData } from '../../actions/staff/gridDataHooks';
import { LiveTimerControl } from '../shared/LiveTimerControl';
import { unlockClueForTeam } from 'modules/staff/clues/service';
import { updateCallForTeam } from 'modules/staff/teams/service';
import { TanstackTable } from 'components/shared/TanstackTable';

const getFriendlyNameForCallType = (type) => {
    switch (type) {
        case 'Hint':
            return 'Hint Call';
        case 'TeamHelp':
            return 'Help Request';
        case 'TeamFree':
            return 'New Puzzle Request';
        case 'Checkin':
            return 'Routine Check-in';
        case 'Other':
        case 'None':
        default:
            return 'GC In Call';
    }
};

const AcknowledgedText = 'Game Control has received your request and will assist you momentarily.';
const AcknowledgedAFewMinutes = 'Game Control has received your request and will assist you in a few minutes.';
const AcknowledgedTenToFifteenMinutes =
    'Game Control has received your request and will assist you in about ten to fifteen minutes.  Perhaps this would be a good time to consider taking a short break?';

const StaffActionCenter = (props) => {
    document.title = 'Game Control - Action Center';

    const { data, refresh } = useStaffGridData({ noRefresh: false, fastRefresh: props.match.params.fastRefresh });
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const history = useHistory();

    const acknowledge = (teamId, call, notes) => {
        let updatedCall = { ...call, publicNotes: notes };

        dispatch(updateCallForTeam(teamId, updatedCall));
        setTimeout(refresh, 500);
    };

    const switchToGcCall = (team, call) => {
        const teamId = team.id;
        const updatedCall = { ...call, callEnd: moment.utc().format() };
        dispatch(
            updateCallForTeam(teamId, updatedCall, () => {
                dispatch(
                    updateCallForTeam(teamId, {
                        callType: 'Hint',
                        callSubType: 'None',
                        tableOfContentsEntry: team.currentTocId,
                        notes: 'Created by ' + user.data.displayName,
                    })
                );
                history.push('/staff/teams/' + teamId);
            })
        );
    };

    const unlockPuzzleAndEndCall = (teamId, tableOfContentId, puzzleName, call) => {
        dispatch(unlockClueForTeam(teamId, tableOfContentId, 'GcUnlock'));
        endCall(teamId, { ...call, publicNotes: puzzleName + ' unlocked.' });
    };

    const checkInWithTeam = (teamId, message) => {
        dispatch(updateCallForTeam(teamId, { callEnd: moment.utc().format(), callType: 'Checkin' }));
        setTimeout(refresh, 500);
    };

    const endCall = (teamId, call) => {
        const updatedCall = { ...call, callEnd: moment.utc().format() };
        dispatch(updateCallForTeam(teamId, updatedCall));
        setTimeout(refresh, 500);
    };

    let teams = [];
    if (data.teams) {
        teams = data.teams.map((team) => {
            const activeCall = team.callHistory.find((x) => !x.callEnd);
            const activeCallAge = activeCall && activeCall.callStart ? <LiveTimerControl timestamp={_.get(activeCall, 'callStart')} /> : 'unknown time';
            const mostRecentCall = _.first((_.get(team, 'callHistory') ?? []).sort((a, b) => Date.parse(b.callEnd) - Date.parse(a.callEnd)));
            const mostRecentCallEnd = _.get(mostRecentCall, 'callEnd');
            const minutesSinceMostRecentCallStart = activeCall ? moment.duration(moment.utc().diff(moment.utc(_.get(mostRecentCall, 'callStart')))).asMinutes() : 999999;
            const minutesSinceLastCall = activeCall
                ? -50000
                : mostRecentCall && mostRecentCall.callEnd
                ? moment.duration(moment.utc().diff(moment.utc(_.get(mostRecentCall, 'callEnd')))).asMinutes()
                : -1;
            const isRequest = activeCall && (activeCall.callType === 'TeamFree' || activeCall.callType === 'TeamHelp');
            const callSortOrder = minutesSinceMostRecentCallStart + (isRequest ? 0 : -10000);
            const solvingMinutes = team.currentPuzzle?.startTime ? moment.duration(moment.utc().diff(moment.utc(team.currentPuzzle.startTime))).asMinutes() : undefined;

            return {
                id: team.teamId,
                team: team,
                name: team.name,
                gcNotes: team.gcNotes ?? '',
                isSolving: team.currentPuzzle && team.currentPuzzle.isActive,
                currentPuzzleName: _.get(data.clues, _.get(team, 'currentPuzzle.clueId', 'invalid') + '.submittableTitle'),
                currentPuzzleId: _.get(team, 'currentPuzzle.clueId'),
                currentTocId: _.get(data.clues, _.get(team, 'currentPuzzle.clueId', 'invalid') + '.tableOfContentId'),
                activeCall,
                activeCallAge,
                mostRecentCall,
                minutesSinceLastCall,
                solvingMinutes,
                isRequest,
                callSortOrder,
                minutesSinceMostRecentCallStart,
                solveStartTime: team.currentPuzzle?.startTime,
                mostRecentCallEnd,
            };
        });
    }

    const tanColumns = [
        {
            id: 'teamStatus',
            header: () => <span>All Teams</span>,
            columns: [
                {
                    id: 'status',
                    header: () => <span>Status</span>,
                    accessorFn: (row) => row,
                    cell: (cell) => {
                        const call = cell.getValue().activeCall;
                        if (call) {
                            if (call.callType === 'TeamFree') {
                                return 'Puzzle Requested';
                            }
                            if (call.callType === 'TeamHelp') {
                                return 'Help Requested';
                            }
                            if (call.callType === 'Checkin') {
                                return 'Routine Checkin';
                            }
                            return 'In Call';
                        }
                        if (cell.getValue().isSolving) {
                            return 'Solving';
                        }
                        return 'Idle';
                    },
                },
                {
                    id: 'teamName',
                    header: () => <span>Team Name</span>,
                    accessorFn: (row) => row,
                    cell: (cell) => (
                        <Button variant="link" onClick={() => history.push('/staff/teams/' + cell.getValue().id)}>
                            {cell.getValue().name}
                        </Button>
                    ),
                },
                {
                    id: 'currentPuzzle',
                    header: () => <span>Current Puzzle</span>,
                    accessorFn: (row) => row.currentPuzzleName,
                },
                {
                    id: 'timeOnPuzzle',
                    header: () => <span>Time Working On Puzzle</span>,
                    accessorFn: (row) => row.solveStartTime,
                    cell: (cell) => (cell.getValue() ? <LiveTimerControl timestamp={cell.getValue()} /> : ''),
                },
                {
                    id: 'mostRecentCall',
                    header: () => <span>Time Since Last Call</span>,
                    accessorFn: (row) => row,
                    cell: (cell) =>
                        cell.getValue().activeCall ? (
                            'Call Active'
                        ) : cell.getValue().mostRecentCallEnd ? (
                            <LiveTimerControl timestamp={cell.getValue().mostRecentCallEnd} />
                        ) : (
                            'Never'
                        ),
                },
                {
                    id: 'gcNotes',
                    header: () => <span>GC Notes</span>,
                    accessorFn: (row) => row.gcNotes,
                    cell: (cell) => <div title={cell.getValue()}>{cell.getValue().length > 128 ? cell.getValue().substring(0, 128) + '...' : cell.getValue()}</div>,
                },
            ],
        },
    ];

    const tanTable = useReactTable({
        data: teams,
        columns: tanColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (!teams) {
        return <Spinner animation="border" />;
    } else {
        return (
            <>
                <Card className="text-left">
                    <Card.Header>Open Calls</Card.Header>
                    <Card.Body>
                        <CardDeck>
                            {_.filter(teams, (t) => t && t.activeCall)
                                .sort((a, b) => b.callSortOrder - a.callSortOrder)
                                .map((team) => {
                                    const call = team.activeCall;
                                    const isAcknowledged = team.activeCall.publicNotes;

                                    let eligiblePuzzles = _.filter(team.team.puzzles, (p) => p.isNotStarted) ?? [];
                                    eligiblePuzzles = eligiblePuzzles.map((puzzle) => ({
                                        ...puzzle,
                                        ...data.clues[puzzle.clueId],
                                        instanceCount: data.clues[puzzle.clueId].instances.length,
                                        freeInstanceCount: data.clues[puzzle.clueId].instances.filter((x) => !x.currentTeam && !x.needsReset).length,
                                    }));
                                    eligiblePuzzles.sort((a, b) => {
                                        return (a.sortOrder < 100 ? a.sortOrder + 1000 : a.sortOrder) - (b.sortOrder < 100 ? b.sortOrder + 1000 : b.sortOrder);
                                    });

                                    let cardclass = 'actionCenterCard';
                                    if (call.callType === 'Hint') {
                                        cardclass += ' actionCenterCardInCall';
                                    } else if (!isAcknowledged) {
                                        cardclass += ' actionCenterCardActionRequired';
                                    }

                                    return (
                                        <Card className={cardclass}>
                                            <Card.Header>
                                                {team.gcNotes && (
                                                    <div title={team.gcNotes}>
                                                        <GrNotes className="mr-2" />
                                                    </div>
                                                )}
                                                <Button variant="link" style={{ color: 'black' }} onClick={() => history.push('/staff/teams/' + team.id)}>
                                                    {team.name}
                                                </Button>
                                            </Card.Header>

                                            <Card.Body>
                                                <Card.Title className="truncated">{getFriendlyNameForCallType(call.callType)}</Card.Title>
                                                {(call.callType === 'TeamHelp' || call.callType === 'TeamFree') && !isAcknowledged && (
                                                    <DropdownButton title="Acknowledge">
                                                        <Dropdown.Item onClick={() => acknowledge(team.id, call, AcknowledgedText)}>Momentarily</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => acknowledge(team.id, call, AcknowledgedAFewMinutes)}>A Few Minutes</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => acknowledge(team.id, call, AcknowledgedTenToFifteenMinutes)}>
                                                            10-15 Minutes (suggest a break)
                                                        </Dropdown.Item>
                                                    </DropdownButton>
                                                )}
                                                {call.callType === 'TeamHelp' && <Button onClick={() => switchToGcCall(team, call)}>Start GC Call</Button>}
                                                {call.callType === 'TeamHelp' && <Button onClick={() => endCall(team.id, call)}>Close</Button>}
                                                {call.callType === 'TeamFree' && (
                                                    <>
                                                        <DropdownButton title="Assign Puzzle">
                                                            {eligiblePuzzles.map((puzzle) => (
                                                                <Dropdown.Item
                                                                    onClick={() => unlockPuzzleAndEndCall(team.id, puzzle.tableOfContentId, puzzle.submittableTitle, call)}
                                                                >
                                                                    {puzzle.instanceCount > 0 && (
                                                                        <>
                                                                            ({puzzle.freeInstanceCount}/{puzzle.instanceCount})
                                                                        </>
                                                                    )}{' '}
                                                                    {puzzle.submittableTitle}
                                                                </Dropdown.Item>
                                                            ))}
                                                        </DropdownButton>
                                                        <Button onClick={() => endCall(team.id, call)}>Cancel Request</Button>
                                                    </>
                                                )}
                                                {call.callType !== 'TeamHelp' && call.callType !== 'TeamFree' && (
                                                    <>
                                                        <Button onClick={() => history.push('/staff/teams/' + team.id)}>Edit Call</Button>
                                                        <Button onClick={() => endCall(team.id, call)}>Close</Button>
                                                    </>
                                                )}
                                                <hr />
                                                <div>
                                                    <FaRegClock className="mr-2" />
                                                    {team.activeCallAge ?? 'Unknown'}
                                                </div>
                                                {team.isSolving && (
                                                    <div>
                                                        <FaPuzzlePiece className="mr-2" />
                                                        {team.currentPuzzleName}
                                                    </div>
                                                )}
                                                {call.callType === 'TeamFree' && team.isSolving && <Alert variant="warning">Warning: Currently solving a puzzle</Alert>}
                                                <hr />
                                                <div className="actionCenterNotes">
                                                    {call.notes && <div className="actionCenterNotes">{call.notes}</div>}
                                                    {call.teamNotes && (
                                                        <div className="actionCenterChat">
                                                            <Badge variant="info" className="mr-2">
                                                                Team
                                                                <FiMessageCircle className="ml-2" />
                                                            </Badge>{' '}
                                                            {call.teamNotes}
                                                        </div>
                                                    )}
                                                    {call.publicNotes && call.publicNotes !== AcknowledgedText && (
                                                        <div className="actionCenterChat">
                                                            <Badge variant="secondary" className="mr-2">
                                                                GC
                                                                <FiMessageCircle className="ml-2" />
                                                            </Badge>
                                                            {call.publicNotes}
                                                        </div>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                        </CardDeck>
                    </Card.Body>
                </Card>

                <Card className="text-left">
                    <Card.Header>Active Solves</Card.Header>
                    <Card.Body>
                        <CardDeck>
                            {_.filter(teams, (t) => t && t.isSolving)
                                .sort((a, b) => b.minutesSinceLastCall - a.minutesSinceLastCall)
                                .map((team) => {
                                    return (
                                        <Card className="actionCenterCard">
                                            <Card.Header>
                                                {team.gcNotes && (
                                                    <div title={team.gcNotes}>
                                                        <GrNotes className="mr-2" />
                                                    </div>
                                                )}
                                                <Button variant="link" onClick={() => history.push('/staff/teams/' + team.id)}>
                                                    {team.name}
                                                </Button>
                                            </Card.Header>
                                            <Card.Body>
                                                <div>
                                                    <FaPuzzlePiece className="mr-2" title="Current Puzzle" />
                                                    {team.currentPuzzleName}
                                                </div>
                                                <div>
                                                    <FaRegClock className="mr-2" title="Time Working On Puzzle" />
                                                    <LiveTimerControl timestamp={team.solveStartTime} />
                                                </div>
                                                <div>
                                                    <MdContactPhone className="mr-2" title="Last Contacted" />
                                                    {team.activeCall ? 'Call Active' : team.mostRecentCallEnd ? <LiveTimerControl timestamp={team.mostRecentCallEnd} /> : 'Never'}
                                                </div>
                                                {<Button onClick={() => checkInWithTeam(team.id, 'Snooze Button')}>Snooze</Button>}
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                        </CardDeck>
                    </Card.Body>
                </Card>

                <Card className="text-left">
                    <Card.Header>All Teams</Card.Header>
                    <Card.Body>
                        <TanstackTable table={tanTable} />
                    </Card.Body>
                </Card>
            </>
        );
    }
};

export default StaffActionCenter;
