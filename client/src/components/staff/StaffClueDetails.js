import React from 'react';
import { Alert, Breadcrumb, Button, DropdownButton, Dropdown, Tab, Tabs } from 'react-bootstrap';
import { FaImages, FaMapPin, FaPen, FaPlus } from "react-icons/fa";
import { LinkContainer } from 'react-router-bootstrap';
import { connect } from 'react-redux';
import * as moment from 'moment';

import { getStaffPuzzleDetails } from 'modules'
import { getStaffTeams, shouldRefreshTeams, shouldRefreshClues } from 'modules/staff';
import { addAnswerToClue, addContentToClue, addLocationToClue, createClue, deleteClue, deleteContent, fetchStaffClueDetails, fetchStaffClues, relockClueForTeam, unlockClueForTeam } from 'modules/staff/clues/service';
import { fetchStaffTeams } from "modules/staff/teams/service";
import { fetchStaffAchievements, getAchievementsModule, shouldRefreshAchievements } from 'modules/staff/achievements';

import { AnswerForm, ClueForm, ContentForm, LocationForm } from './dialogs';
import DialogRenderProp from './dialogs/DialogRenderProp';
import { PuzzleInstances, PuzzlePlayerManifest, StaffClueContent } from './puzzleDetails';

import { TeamStatusList } from './presentation/TeamStatusList';
import PuzzleAnswersList from './presentation/PuzzleAnswersList';
import PuzzleRatingList from './presentation/PuzzleRatingList';
import { getStaffClues } from 'modules/staff/clues/selectors';

const ClueRatings = ({ ratings }) => {
    if (ratings && ratings.length > 0) {
        return (
            <div>
                <h4>Player Ratings</h4>
                <div>
                    <PuzzleRatingList ratings={ratings}/>
                </div>
            </div>
        );
    } else {
        return <div>No ratings are available</div>;
    }
};

const ClueLogistics = ({ clue }) => {
    return (
        <div>
            { !!clue.openTime && <div>Puzzle opens at {moment.utc(clue.openTime).local().format('dddd HH:mm')}</div> }
            { !!clue.closingTime && <div>Puzzle closes at {moment.utc(clue.closingTime).local().format('dddd HH:mm')}</div>}
            { !!clue.parSolveTime && <div>Expected solve time is {clue.parSolveTime} minutes</div> }
        </div>
    );
};

const ErrorBanner = ({ error }) => !!error && <Alert variant='danger'>{error}</Alert>;

class StaffClueDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showAddUnlock: false,
            key: this.props.match.params.tab
        }
    }

    componentWillMount() {
        this.props.getStaffClueDetails(this.props.match.params.id);

        // TODO: Need the full list of clues for unlocks and a few other things, consider a
        // similar refactoring to teams to optimize here in the future.
        if (shouldRefreshClues(this.props.clues)) {
            this.props.getStaffClues();
        }

        // Fetch the teams for populating options for team-specific unlocks. 
        // We'll only fetch if the teams have never been loaded.
        if (shouldRefreshTeams(this.props.teams)) {
            this.props.fetchTeams();
        }

        // Need the list of achievements for achievement-specific content unlocks
        if (shouldRefreshAchievements(this.props.achievements)) {
            this.props.fetchStaffAchievements();
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.match.params.id !== this.props.match.params.id) {
            this.props.getStaffClueDetails(newProps.match.params.id);
        }
        if (newProps.match.params.tab !== this.props.match.params.tab) {
            this.setState({key: newProps.match.params.tab});
        }
    }

    updateCurrentTab = (k) => {
        this.setState({key: k});
        this.props.history.replace("/staff/clues/"+this.props.match.params.id+"/"+k);
    }

    unlockPuzzleForTeam(teamId, tableOfContentId, reason) {
        this.props.unlockClueForTeam(
            teamId, 
            tableOfContentId,
            reason);
    }

    relockPuzzleForTeam(teamId, tableOfContentId) {
        this.props.relockClueForTeam(teamId, tableOfContentId);
    }

    render() {
        const foundClue = this.props.currentClue;

        if (this.props.clues.isLoading) {
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
                        <DropdownButton
                            key={foundClue.tableOfContentId}
                            className="m-2"
                            title={foundClue.submittableTitle}
                            id={`split-button-basic-${foundClue.submittableTitle}`}
                        >
                            {this.props.clues.clues.map(clue => 
                                <LinkContainer to={"/staff/clues/" + clue.tableOfContentId} key={clue.tableOfContentId}>
                                    <Dropdown.Item key={clue.tableOfContentId}
                                        eventKey={clue.tableOfContentId}>
                                        {clue.submittableTitle}
                                    </Dropdown.Item>
                                </LinkContainer>
                            )}
                        </DropdownButton>
                        <DialogRenderProp
                            className="m-2"
                            variant="outline-primary"
                            renderTitle={() => "Edit Puzzle"}
                            renderButton={() => <><FaPen/> Edit</>}
                            renderBody={onComplete =>
                                <ClueForm
                                    onSubmit={this.props.createClue}
                                    clue={foundClue}
                                    onComplete={onComplete}
                                />
                            }
                        />
                    </div>

                    <ErrorBanner error={this.props.clues.lastError} />

                    <Tabs defaultActiveKey={1} id="puzzle-details-tabs" activeKey={this.state.key}  onSelect={this.updateCurrentTab}>
                        <Tab eventKey={1} title="Teams">
                            <TeamStatusList 
                                teamsStatus={foundClue.teamsStatus}
                                onUnlock={teamId => this.unlockPuzzleForTeam(teamId, foundClue.tableOfContentId, 'GcUnlock')}
                                onSkip={teamId => this.unlockPuzzleForTeam(teamId, foundClue.tableOfContentId, "Skip")}
                                onRelock={teamId => this.relockPuzzleForTeam(teamId, foundClue.tableOfContentId)}
                                />
                        </Tab>
                        <Tab eventKey={2} title="Content">
                            <DialogRenderProp
                                className="m-2"
                                variant="outline-primary"
                                renderTitle={() => "Add content to puzzle"}
                                renderButton={() => <><FaImages/> Add Content</>}
                                renderBody={onComplete =>
                                    <ContentForm
                                        achievements={this.props.achievements.data}
                                        onSubmit={content => {
                                            this.props.addContentToClue(foundClue.tableOfContentId, content);
                                            onComplete();
                                        }}
                                    />
                                }
                            />
                            <DialogRenderProp
                                className="m-2"
                                variant="outline-primary"
                                renderTitle={() => "Add location to puzzle"}
                                renderButton={() => <><FaMapPin/> Add Location</>}
                                renderBody={onComplete =>
                                    <LocationForm
                                        onSubmit={location => {
                                            this.props.addLocationToClue(foundClue.tableOfContentId, location);
                                            onComplete();
                                        }}
                                    />
                                }
                            />
                            <StaffClueContent
                                content={foundClue.content}
                                achievements={this.props.achievements.data}
                                tableOfContentId={foundClue.tableOfContentId}
                                addContentToClue={this.props.addContentToClue}
                                addLocationToClue={this.props.addLocationToClue}
                                deleteContent={this.props.deleteContent}
                            />
                        </Tab>
                        <Tab eventKey={3} title="Answers">
                            <DialogRenderProp
                                variant="outline-primary"
                                renderTitle={() => "Add Answer"}
                                renderButton={() => <><FaPlus/> Add Answer</>}
                                disabled={this.props.clues.isAddingAnswer}
                                renderBody={onComplete =>
                                    <AnswerForm
                                        teams={this.props.teams.data}
                                        onSubmit={answer => {
                                            this.props.addAnswerToClue(this.props.match.params.id, answer);
                                            onComplete();
                                        }}
                                    />
                                }
                            />
                            <PuzzleAnswersList clue={foundClue}/>
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
                            <PuzzlePlayerManifest tableOfContentId={foundClue.tableOfContentId}/>
                        </Tab>
                        {
                            !!this.props.user.isAdmin &&
                            <Tab eventKey={8} title="Admin">
                                <Button onClick={() => this.props.deleteClue(this.props.match.params.id)}>Delete Puzzle</Button>
                            </Tab>
                        }
                    </Tabs>
                </div>
            );
        } else {
            return <div>ERROR: Could not find puzzle...</div>;
        }
    }
}

const mapStateToProps = (state, initProps) => ({
    user: state.user,
    clues: getStaffClues(state),
    achievements: getAchievementsModule(state),
    currentClue: getStaffPuzzleDetails(state, initProps.match.params.id),
    teams: getStaffTeams(state)
})

const mapDispatchToProps = (dispatch) => ({
    fetchTeams: () => dispatch(fetchStaffTeams()),
    getStaffClues: () => dispatch(fetchStaffClues()),
    getStaffClueDetails: (tableOfContentId) => dispatch(fetchStaffClueDetails(tableOfContentId)),
    createClue: (clueTemplate) => dispatch(createClue(clueTemplate)),
    deleteClue: (tableOfContentId) => dispatch(deleteClue(tableOfContentId)),    
    addAnswerToClue: (tableOfContentId, answerTemplate) => dispatch(addAnswerToClue(tableOfContentId, answerTemplate)),
    addContentToClue: (tableOfContentId, contentTemplate) => dispatch(addContentToClue(tableOfContentId, contentTemplate)),
    addLocationToClue: (tableOfContentId, locationTemplate) => dispatch(addLocationToClue(tableOfContentId, locationTemplate)),
    deleteContent: (tableOfContentId, contentId) => dispatch(deleteContent(tableOfContentId, contentId)),
    unlockClueForTeam: (teamId, tableOfContentId, reason) => dispatch(unlockClueForTeam(teamId, tableOfContentId, reason)),
    relockClueForTeam: (teamId, tableOfContentId) => dispatch(relockClueForTeam(teamId, tableOfContentId)),
    fetchStaffAchievements: () => dispatch(fetchStaffAchievements())
})

export default connect(mapStateToProps, mapDispatchToProps)(StaffClueDetails);