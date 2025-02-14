import { useState } from 'react';
import { Alert, Breadcrumb, Button, DropdownButton, Dropdown, Tab, Tabs } from 'react-bootstrap';
import { FaImages, FaMapPin, FaPen, FaPlus } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { connect, useDispatch, useSelector } from 'react-redux';

import { getIsUserAdmin, getStaffPuzzleDetails } from 'modules';
import { getStaffTeams, shouldRefreshTeams, shouldRefreshClues, useStaffTeams } from 'modules/staff';
import {
    addAnswerToClue,
    addContentToClue,
    addLocationToClue,
    createClue,
    deleteClue,
    deleteContent,
    fetchStaffClueDetails,
    fetchStaffClues,
    relockClueForTeam,
    unlockClueForTeam,
} from 'modules/staff/clues/service';
import { fetchStaffTeams } from 'modules/staff/teams/service';
import { fetchStaffAchievements, getAchievementsModule, shouldRefreshAchievements, useStaffAchievements } from 'modules/staff/achievements';

import { AnswerForm, ClueForm, ContentForm, LocationForm } from './dialogs';
import DialogRenderProp from './dialogs/DialogRenderProp';
import { PuzzleInstances, PuzzlePlayerManifest, StaffClueContent, ClueRatings, ClueLogistics } from './puzzleDetails';

import { TeamStatusList } from './presentation/TeamStatusList';
import PuzzleAnswersList from './presentation/PuzzleAnswersList';

import { getStaffClues } from 'modules/staff/clues/selectors';
import { useHistory, useParams } from 'react-router';
import { AnswerTemplate, ContentTemplate, LocationTemplate, StaffClue, StaffClueTemplate, useStaffClues } from 'modules/staff/clues';

const ErrorBanner = ({ error }: { error: string }) => (!!error ? <Alert variant="danger">{error}</Alert> : null);

const StaffClueDetails = () => {
    const { id, tab } = useParams<{ id: string; tab: string }>();
    const history = useHistory();
    const [key, setKey] = useState(tab);
    const dispatch = useDispatch();

    const { cluesModule } = useStaffClues();
    const { staffAchievementsModule } = useStaffAchievements();
    const { teams } = useStaffTeams();
    const isUserAdmin = useSelector(getIsUserAdmin);
    const currentClue = useSelector((state) => getStaffPuzzleDetails(state, id));

    const updateCurrentTab = (k: string) => {
        setKey(k);
        history.replace('/staff/clues/' + id + '/' + k);
    };

    const createClue = (clueTemplate: StaffClueTemplate): void => dispatch(createClue(clueTemplate));
    const deleteClue = (tableOfContentId: string): void => dispatch(deleteClue(tableOfContentId));
    const addContentToClue = (tableOfContentId: string, content: ContentTemplate): void => dispatch(addContentToClue(tableOfContentId, content));
    const deleteContent = (tableOfContentId: string, contentId: string): void => dispatch(deleteContent(tableOfContentId, contentId));
    const unlockPuzzleForTeam = (teamId: string, tableOfContentId: string, reason: string) => dispatch(unlockClueForTeam(teamId, tableOfContentId, reason));
    const relockPuzzleForTeam = (teamId: string, tableOfContentId: string) => dispatch(relockClueForTeam(teamId, tableOfContentId));
    const addAnswerToClue = (tableOfContentId: string, answerTemplate: AnswerTemplate): void => dispatch(addAnswerToClue(tableOfContentId, answerTemplate));
    const addLocationToClue = (tableOfContentId: string, locationTemplate: LocationTemplate): void => dispatch(addLocationToClue(tableOfContentId, locationTemplate));

    const foundClue = currentClue;

    if (cluesModule.isLoading) {
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
                        {cluesModule.data.map((clue) => (
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
                        renderBody={(onComplete) => <ClueForm onSubmit={createClue} clue={foundClue} onComplete={onComplete} />}
                    />
                </div>

                <ErrorBanner error={cluesModule.lastError} />

                <Tabs defaultActiveKey={1} id="puzzle-details-tabs" activeKey={key} onSelect={(eventKey) => updateCurrentTab(eventKey ?? '')}>
                    <Tab eventKey={1} title="Teams">
                        <TeamStatusList
                            teamsStatus={foundClue.teamsStatus}
                            onUnlock={(teamId) => unlockPuzzleForTeam(teamId, foundClue.tableOfContentId, 'GcUnlock')}
                            onSkip={(teamId) => unlockPuzzleForTeam(teamId, foundClue.tableOfContentId, 'Skip')}
                            onRelock={(teamId) => relockPuzzleForTeam(teamId, foundClue.tableOfContentId)}
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
                                    achievements={staffAchievementsModule.data}
                                    onSubmit={(content) => {
                                        addContentToClue(foundClue.tableOfContentId, content);
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
                                        addLocationToClue(foundClue.tableOfContentId, location);
                                        onComplete();
                                    }}
                                />
                            )}
                        />
                        <StaffClueContent
                            content={foundClue.content}
                            achievements={staffAchievementsModule.data}
                            tableOfContentId={foundClue.tableOfContentId}
                            addContentToClue={addContentToClue}
                            addLocationToClue={addLocationToClue}
                            deleteContent={deleteContent}
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
                            disabled={cluesModule.isAddingAnswer}
                            renderBody={(onComplete) => (
                                <AnswerForm
                                    teams={teams.data}
                                    onSubmit={(answer) => {
                                        addAnswerToClue(id, answer);
                                        onComplete();
                                    }}
                                />
                            )}
                        />
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
                            <Button onClick={() => deleteClue(id)}>Delete Puzzle</Button>
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
