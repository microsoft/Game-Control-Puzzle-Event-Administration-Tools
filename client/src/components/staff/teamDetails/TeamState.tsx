import { useState } from 'react';
import { Button, Card, Col, Container, Form, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { FaFastForward, FaLock, FaPuzzlePiece, FaSortNumericDown, FaUnlockAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';

import { Content, SkipPlot, SolvedPlot, UnsolvedPlot } from 'modules/types';
import { getCluesModule, getStaffTeam, SortOrderOverride } from 'modules/staff';
import { SolveStatus, StaffClue } from 'modules/staff/clues';
import { relockClueForTeam, unlockClueForTeam } from 'modules/staff/clues/service';
import { updateTeamAdditionalData } from 'modules/staff/teams/service';
import { AdditionalContent } from '../presentation/AdditionalContent';
import DialogRenderProp from '../dialogs/DialogRenderProp';
import { SortOrderForm } from '../dialogs/SortOrderForm';
import { ClueIcon } from '../presentation/ClueIcon';

type ActionProps = Readonly<{
    status: SolveStatus;
    clue: StaffClue;
    sortOrder: number;
    onRelock: (tableOfContentId: string) => void;
    onUnlock: (tableOfContentId: string) => void;
    onSkip: (tableOfConentId: string) => void;
    onChangeSortOrder: (tableOfcontentId: string, sortOrder: number) => void;
}>;

const ClueActions = ({ status, clue, sortOrder, onRelock, onUnlock, onSkip, onChangeSortOrder }: ActionProps) => {
    const showRelock = status.isSkipped || status.startTime;
    const showUnlock = !status.isSkipped && !status.startTime;
    const showSkip = !status.isSkipped && !status.startTime;

    return (
        <>
            <LinkContainer to={`/staff/clues/${clue.tableOfContentId}`}>
                <Button active>
                    <FaPuzzlePiece className="mr-2" /> Info
                </Button>
            </LinkContainer>
            <DialogRenderProp
                variant="primary"
                renderTitle={() => 'Override Sort Order'}
                renderButton={() => (
                    <>
                        <FaSortNumericDown className="mr-2" /> Reorder
                    </>
                )}
                renderBody={(onComplete: any) => (
                    <SortOrderForm
                        defaultSortOrder={sortOrder}
                        onSubmit={(newOrder) => {
                            onChangeSortOrder(clue.tableOfContentId, newOrder);
                            onComplete();
                        }}
                    />
                )}
            />
            {showRelock && (
                <Button onClick={() => onRelock(clue.tableOfContentId)}>
                    <FaLock className="mr-2" /> Lock
                </Button>
            )}
            {showUnlock && (
                <Button onClick={() => onUnlock(clue.tableOfContentId)}>
                    <FaUnlockAlt className="mr-2" /> Unlock
                </Button>
            )}
            {showSkip && (
                <Button variant="warning" onClick={() => onSkip(clue.tableOfContentId)}>
                    <FaFastForward className="mr-2" /> Skip
                </Button>
            )}
        </>
    );
};

const CluePlotContent = ({ status, contentList }: { status: SolveStatus; contentList: Content[] }) => {
    if (status.solveTime) {
        const solvedPlot = contentList.filter((content) => content.name === SolvedPlot);

        if (solvedPlot.length > 0) {
            return (
                <>
                    {solvedPlot.map((content) => (
                        <AdditionalContent key={content.contentId} content={content} />
                    ))}
                </>
            );
        }
    } else if (status.isSkipped) {
        const skippedPlot = contentList.filter((content) => content.name === SkipPlot);

        if (skippedPlot.length > 0) {
            return (
                <>
                    {skippedPlot.map((content) => (
                        <AdditionalContent key={content.contentId} content={content} />
                    ))}
                </>
            );
        } else {
            return (
                <>
                    <em>This clue has no plot for the skipped state and is not visible to the team</em>
                </>
            );
        }
    } else if (!status.isSkipped) {
        const unsolvedPlot = contentList.filter((content) => content.name === UnsolvedPlot);

        if (unsolvedPlot.length > 0) {
            return (
                <>
                    {unsolvedPlot.map((content) => (
                        <AdditionalContent key={content.contentId} content={content} />
                    ))}
                </>
            );
        }
    }

    return null;
};

export const TeamState = ({ teamId }: { teamId: string }) => {
    const cluesModule = useSelector(getCluesModule);
    const currentTeam = useSelector((state: any) => getStaffTeam(state, teamId));
    const teamSortOverrides = currentTeam?.additionalData?.sortOverride;
    const dispatch = useDispatch();

    const [hideContent, setHideContent] = useState(true);

    const currentCluesForTeam = cluesModule.data;

    const getVariantForClue = (clue: StaffClue): 'success' | 'warning' | 'danger' | undefined => {
        const teamStatus = clue.teamsStatus.find((status) => teamId === status.teamId);

        if (teamStatus?.solveTime) {
            return 'success';
        } else if (teamStatus?.isSkipped) {
            return 'danger';
        } else if (teamStatus?.startTime) {
            return 'warning';
        }

        return undefined;
    };

    const sortedClues = currentCluesForTeam.sort((a: any, b: any) => {
        const aSortOrder = teamSortOverrides?.find((x) => x.tableOfContentId === a.tableOfContentId)?.sortOrder ?? a.sortOrder;
        const bSortOrder = teamSortOverrides?.find((x) => x.tableOfContentId === b.tableOfContentId)?.sortOrder ?? b.sortOrder;
        return aSortOrder - bSortOrder;
    });

    return (
        <div>
            <Card>
                <Card.Header>
                    Clues for {currentTeam?.name}
                    <div>
                        <Form.Check
                            id="hideContentSwitch"
                            type="switch"
                            checked={hideContent}
                            onChange={(event: any) => setHideContent(event.target.checked)}
                            label="Hide Content for Clues"
                        />
                    </div>
                </Card.Header>
                <Card.Body>
                    <ListGroup>
                        {sortedClues.map((clue: StaffClue) => {
                            const teamStatus = clue.teamsStatus.find((status) => teamId === status.teamId);
                            const override = teamSortOverrides?.find((x) => x.tableOfContentId === clue.tableOfContentId);
                            const hasSkipPlot = clue.content.find((x) => x.name === SkipPlot);
                            const titleStyle = !hasSkipPlot && teamStatus?.isSkipped ? { textDecoration: 'line-through' } : undefined;

                            const overrideDisplay = override ? (
                                <>
                                    ({override.sortOrder} <s>{clue.sortOrder}</s>)
                                </>
                            ) : (
                                <>({clue.sortOrder})</>
                            );

                            if (teamStatus) {
                                return (
                                    <ListGroupItem key={clue.tableOfContentId} variant={getVariantForClue(clue)}>
                                        <Container fluid>
                                            <Row>
                                                <Col>
                                                    <h5 style={titleStyle}>
                                                        <ClueIcon className="mr-2" clue={clue} />
                                                        {clue.submittableTitle} {overrideDisplay}
                                                    </h5>
                                                    {!hideContent && <CluePlotContent status={teamStatus} contentList={clue.content} />}
                                                </Col>
                                                <Col style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }} md="auto">
                                                    <ClueActions
                                                        status={teamStatus}
                                                        clue={clue}
                                                        sortOrder={override?.sortOrder ?? clue.sortOrder}
                                                        onRelock={(tableOfContentId) => dispatch(relockClueForTeam(teamId, tableOfContentId))}
                                                        onUnlock={(tableOfContentId) => dispatch(unlockClueForTeam(teamId, tableOfContentId, 'GcUnlock'))}
                                                        onSkip={(tableOfContentId) => dispatch(unlockClueForTeam(teamId, tableOfContentId, 'Skip'))}
                                                        onChangeSortOrder={(tableOfContentId, sortOrder) => {
                                                            const sortOverride: SortOrderOverride[] = [];

                                                            if (currentTeam?.additionalData?.sortOverride?.length ?? -1 > 0) {
                                                                currentTeam?.additionalData?.sortOverride?.forEach((override) => {
                                                                    if (override.tableOfContentId !== tableOfContentId) {
                                                                        // Skip existing overrides, we only want to modify the
                                                                        // changed one.
                                                                        sortOverride.push(override);
                                                                    } else if (sortOrder !== clue.sortOrder) {
                                                                        sortOverride.push({ tableOfContentId, sortOrder });
                                                                    }
                                                                });

                                                                if (!sortOverride.find((x) => x.tableOfContentId === tableOfContentId) && clue.sortOrder !== sortOrder) {
                                                                    sortOverride.push({ tableOfContentId, sortOrder });
                                                                }
                                                            } else if (sortOrder !== clue.sortOrder) {
                                                                sortOverride.push({ tableOfContentId, sortOrder });
                                                            }

                                                            dispatch(updateTeamAdditionalData(teamId, { sortOverride }));
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        </Container>
                                    </ListGroupItem>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </ListGroup>
                </Card.Body>
            </Card>
        </div>
    );
};
