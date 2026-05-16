import { useState } from 'react';
import { Alert, Breadcrumb, Button, DropdownButton, Dropdown, Tab, Tabs } from 'react-bootstrap';
import { FaImages, FaMapPin, FaPen, FaPlus } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector } from 'react-redux';

import { getIsUserAdmin } from 'modules';
import { getErrorMessage } from 'lib/apiFetch';
import { useStaffTeamsQuery } from 'modules/staff/teams/queries';
import { useStaffAchievementsQuery } from 'modules/staff/achievements/queries';
import {
    useAddAnswerMutation,
    useAddContentToClueMutation,
    useAddLocationMutation,
    useCreateClueMutation,
    useDeleteClueMutation,
    useDeleteContentMutation,
    useRelockClueForTeamMutation,
    useStaffClueDetailsQuery,
    useStaffCluesQuery,
    useUnlockClueForTeamMutation,
} from 'modules/staff/clues/queries';

import { AnswerForm, ClueForm, ContentForm, LocationForm } from './dialogs';
import DialogRenderProp from './dialogs/DialogRenderProp';
import { PuzzleInstances, PuzzlePlayerManifest, StaffClueContent, ClueRatings, ClueLogistics } from './puzzleDetails';

import { TeamStatusList } from './presentation/TeamStatusList';
import PuzzleAnswersList from './presentation/PuzzleAnswersList';

import { useHistory, useParams } from 'react-router';

const ErrorBanner = ({ error }: { error: string | null }) => (!!error ? <Alert variant="danger">{error}</Alert> : null);

const StaffClueDetails = () => {
    const { id, tab } = useParams<{ id: string; tab: string }>();
    const history = useHistory();
    const [key, setKey] = useState(tab);

    const { data: cluesList = [], isLoading: cluesLoading, error: cluesError } = useStaffCluesQuery();
    const { data: foundClue, isLoading: detailLoading, error: detailError } = useStaffClueDetailsQuery(id);
    const { data: achievements = [] } = useStaffAchievementsQuery();
    const { data: teams = [] } = useStaffTeamsQuery();
    const isUserAdmin = useSelector(getIsUserAdmin);

    const createClueMut = useCreateClueMutation();
    const deleteClueMut = useDeleteClueMutation();
    const addAnswer = useAddAnswerMutation();
    const addContent = useAddContentToClueMutation();
    const addLocation = useAddLocationMutation();
    const deleteContentMut = useDeleteContentMutation();
    const unlockClue = useUnlockClueForTeamMutation();
    const relockClue = useRelockClueForTeamMutation();

    const updateCurrentTab = (k: string) => {
        setKey(k);
        history.replace('/staff/clues/' + id + '/' + k);
    };

    const queryError = detailError ?? cluesError;

    if (cluesLoading || detailLoading) {
        return <div>Loading...</div>;
    } else if (foundClue !== undefined) {
        document.title = foundClue.submittableTitle;

        return (
            <div>
                <Breadcrumb>
                    <LinkContainer to="/staff/clues">
                        <Breadcrumb.Item>Puzzles</Breadcrumb.Item>
                    </LinkContainer>
                    <Breadcrumb.Item active>{foundClue.submittableTitle}</Breadcrumb.Item>
                </Breadcrumb>
                <div className="d-flex justify-content-center mb-2">
                    <DropdownButton key={foundClue.tableOfContentId} className="m-2" title={foundClue.submittableTitle} id={`split-button-basic-${foundClue.submittableTitle}`}>
                        {cluesList.map((clue) => (
                            <LinkContainer to={'/staff/clues/' + clue.tableOfContentId} key={clue.tableOfContentId}>
                                <Dropdown.Item key={clue.tableOfContentId} eventKey={clue.tableOfContentId}>
                                    {clue.submittableTitle}
                                </Dropdown.Item>
                            </LinkContainer>
                        ))}
                    </DropdownButton>
                    <DialogRenderProp
                        className="m-2"
                        variant="outline-primary"
                        renderTitle={() => 'Edit Puzzle'}
                        renderButton={() => (
                            <>
                                <FaPen /> Edit
                            </>
                        )}
                        renderBody={(onComplete) => <ClueForm onSubmit={(template) => createClueMut.mutate(template)} clue={foundClue} onComplete={onComplete} />}
                    />
                </div>

                <ErrorBanner error={queryError ? getErrorMessage(queryError) : null} />

                <Tabs defaultActiveKey={1} id="puzzle-details-tabs" activeKey={key} onSelect={(eventKey) => updateCurrentTab(eventKey ?? '')}>
                    <Tab eventKey={1} title="Teams">
                        <TeamStatusList
                            teamsStatus={foundClue.teamsStatus}
                            onUnlock={(teamId) => unlockClue.mutate({ teamId, tableOfContentId: foundClue.tableOfContentId, reason: 'GcUnlock' })}
                            onSkip={(teamId) => unlockClue.mutate({ teamId, tableOfContentId: foundClue.tableOfContentId, reason: 'Skip' })}
                            onRelock={(teamId) => relockClue.mutate({ teamId, tableOfContentId: foundClue.tableOfContentId })}
                        />
                    </Tab>
                    <Tab eventKey={2} title="Content">
                        <DialogRenderProp
                            className="m-2"
                            variant="outline-primary"
                            renderTitle={() => 'Add content to puzzle'}
                            renderButton={() => (
                                <>
                                    <FaImages /> Add Content
                                </>
                            )}
                            renderBody={(onComplete) => (
                                <ContentForm
                                    achievements={achievements}
                                    onSubmit={(content) => {
                                        addContent.mutate({ tableOfContentId: foundClue.tableOfContentId, contentTemplate: content });
                                        onComplete();
                                    }}
                                />
                            )}
                        />
                        <DialogRenderProp
                            className="m-2"
                            variant="outline-primary"
                            renderTitle={() => 'Add location to puzzle'}
                            renderButton={() => (
                                <>
                                    <FaMapPin /> Add Location
                                </>
                            )}
                            renderBody={(onComplete) => (
                                <LocationForm
                                    onSubmit={(location) => {
                                        addLocation.mutate({ tableOfContentId: foundClue.tableOfContentId, locationTemplate: location });
                                        onComplete();
                                    }}
                                />
                            )}
                        />
                        <StaffClueContent
                            content={foundClue.content}
                            achievements={achievements}
                            tableOfContentId={foundClue.tableOfContentId}
                            addContentToClue={(tableOfContentId, contentTemplate) => addContent.mutate({ tableOfContentId, contentTemplate })}
                            addLocationToClue={(tableOfContentId, locationTemplate) => addLocation.mutate({ tableOfContentId, locationTemplate })}
                            deleteContent={(tableOfContentId, contentId) => deleteContentMut.mutate({ tableOfContentId, contentId })}
                        />
                    </Tab>
                    <Tab eventKey={3} title="Answers">
                        <DialogRenderProp
                            variant="outline-primary"
                            renderTitle={() => 'Add Answer'}
                            renderButton={() => (
                                <>
                                    <FaPlus /> Add Answer
                                </>
                            )}
                            disabled={addAnswer.isPending}
                            renderBody={(onComplete) => (
                                <AnswerForm
                                    teams={teams}
                                    onSubmit={(answer) => {
                                        addAnswer.mutate({ tableOfContentId: id, answerTemplate: answer });
                                        onComplete();
                                    }}
                                />
                            )}
                        />
                        {foundClue.defaultIncorrectResponse ? (
                            <div className="mt-2 mb-2 p-2 border rounded bg-light">
                                <strong>Default response for unrecognized answers:</strong>{' '}
                                <em style={{ whiteSpace: 'pre-wrap', display: 'block' }}>{foundClue.defaultIncorrectResponse}</em>
                            </div>
                        ) : (
                            <div className="mt-2 mb-2 text-muted">
                                <small>No default response configured for unrecognized answers. Edit the puzzle to add one.</small>
                            </div>
                        )}
                        <PuzzleAnswersList clue={foundClue} />
                    </Tab>
                    <Tab eventKey={4} title="Logistics">
                        <ClueLogistics clue={foundClue} />
                    </Tab>
                    <Tab eventKey={5} title="Ratings">
                        <ClueRatings ratings={foundClue.ratings} />
                    </Tab>
                    <Tab eventKey={6} title="Instances">
                        <PuzzleInstances tableOfContentId={foundClue.tableOfContentId} instances={foundClue.instances} />
                    </Tab>
                    <Tab eventKey={7} title="Integration">
                        <PuzzlePlayerManifest tableOfContentId={foundClue.tableOfContentId} />
                    </Tab>
                    {!!isUserAdmin && (
                        <Tab eventKey={8} title="Admin">
                            <Button onClick={() => deleteClueMut.mutate(id)}>Delete Puzzle</Button>
                        </Tab>
                    )}
                </Tabs>
            </div>
        );
    } else {
        return <div>ERROR: Could not find puzzle...</div>;
    }
};

export default StaffClueDetails;
