import moment from 'moment';
import { Container, ListGroup, Row, Button, Alert } from 'react-bootstrap';
import { FaPuzzlePiece, FaChevronDown, FaLocationArrow } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';

import { AdditionalContent } from 'components/staff/presentation/AdditionalContent';
import { CallManager } from './CallManager';
import { PlayerClue, usePlayerClues, usePlayerTakeOverClue } from 'modules/player';
import { SolvedPlot, UnsolvedPlot } from 'modules/types';
import { Redirect } from 'react-router-dom';

const PlotItem = ({ clue }: { clue: PlayerClue }) => {
    const isSolved = !!clue.submissions.find((submission) => submission.isCorrectAnswer) || clue.isSolved;
    const minsSinceUnlock = moment.utc().diff(moment.utc(clue.unlockTime), 'minutes') + 1;
    const clueSolveTimeAnchor =
        minsSinceUnlock > 15 ? (
            <></>
        ) : (
            <div id="newclue">
                <Alert variant="warning">
                    Unlocked {minsSinceUnlock} minute{minsSinceUnlock > 1 && 's'} ago.
                </Alert>
            </div>
        );

    if (isSolved) {
        const solvedPlot = clue.content.filter((content) => content.name === SolvedPlot);

        if (solvedPlot.length > 0) {
            if (clue.submittableType === 'Plot') {
                return (
                    <Container fluid style={{ marginBottom: '37px' }}>
                        <ListGroup.Item>
                            {clueSolveTimeAnchor}
                            <Row style={{ justifyContent: 'center', display: 'flex' }}>
                                {solvedPlot.map((content) => (
                                    <AdditionalContent key={content.contentId} content={content} />
                                ))}
                            </Row>
                        </ListGroup.Item>
                    </Container>
                );
            } else {
                return (
                    <Container fluid style={{ marginBottom: '37px' }}>
                        <ListGroup.Item>
                            {clueSolveTimeAnchor}
                            <Row style={{ justifyContent: 'center', display: 'flex' }}>
                                {solvedPlot.map((content) => (
                                    <AdditionalContent key={content.contentId} content={content} />
                                ))}
                            </Row>
                            <Row style={{ justifyContent: 'center', display: 'flex' }}>
                                <LinkContainer to={`/player/clue/${clue.tableOfContentId}`} style={{ color: '#FFFFFF' }}>
                                    <Button>
                                        {clue.submittableType === 'Puzzle' && <FaPuzzlePiece />}
                                        {clue.submittableType === 'LocUnlock' && <FaLocationArrow />}
                                        {clue.submittableTitle}
                                    </Button>
                                </LinkContainer>
                            </Row>
                        </ListGroup.Item>
                    </Container>
                );
            }
        } else {
            return null;
        }
    } else {
        const unsolvedPlot = clue.content.filter((content) => content.name === UnsolvedPlot);

        if (unsolvedPlot.length > 0) {
            // NOTE: LinkContainer is adding an additional list-group-item-action class to ListGroupItem,
            // which causes the text for a ListGroup.Item with the action prop to be a shade of gray instead
            // of black. We want the hover behavior from action without the gray text, so we'll override the
            // color of the LinkContainer here. If we ever configure site-wide themes this will need to
            // get pulled into that.
            return (
                <Container fluid style={{ marginBottom: '37px' }}>
                    <ListGroup.Item>
                        {clueSolveTimeAnchor}
                        <Row style={{ justifyContent: 'center', display: 'flex' }}>
                            {unsolvedPlot.map((content) => (
                                <AdditionalContent key={content.contentId} content={content} />
                            ))}
                        </Row>
                        <Row style={{ justifyContent: 'center', display: 'flex' }}>
                            <LinkContainer to={`/player/clue/${clue.tableOfContentId}`} style={{ color: '#FFFFFF' }}>
                                <Button>
                                    {clue.submittableType === 'Puzzle' && <FaPuzzlePiece />}
                                    {clue.submittableType === 'LocUnlock' && <FaLocationArrow />}
                                    {clue.submittableTitle}
                                </Button>
                            </LinkContainer>
                        </Row>
                    </ListGroup.Item>
                </Container>
            );
        } else {
            return (
                <Container fluid style={{ marginBottom: '37px' }}>
                    <LinkContainer to={`/player/clue/${clue.tableOfContentId}`} style={{ color: '#FFFFFF' }}>
                        <Button>
                            {clue.submittableType === 'Puzzle' && <FaPuzzlePiece />}
                            {clue.submittableType === 'LocUnlock' && <FaLocationArrow />}
                            {clue.submittableTitle}
                        </Button>
                    </LinkContainer>
                </Container>
            );
        }
    }
};

export const PlayerPlot = () => {
    // TODO: Should the basic title be configurable? Only do so on the plot page?
    //    document.title = "The Story So Far...";
    const { cluesModule } = usePlayerClues();
    const takeOverClue = usePlayerTakeOverClue();
    const sortedClues = cluesModule.data.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const hasAnyCluesNewerThanFifteenMinutes = !!sortedClues.find((clue) => clue.content && clue.content.length && moment.utc().diff(moment.utc(clue.unlockTime), 'minutes') < 15);

    if (takeOverClue) {
        return <Redirect to={`/player/clue/${takeOverClue.tableOfContentId}`} />
    }

    return (
        <div>
            <CallManager />
            {hasAnyCluesNewerThanFifteenMinutes && (
                <Button variant="outline-warning" className="jumpToNewButton" href="#newclue">
                    <div className="jumpToNewButtonIcon">
                        <FaChevronDown />
                        Skip to New Items
                    </div>
                </Button>
            )}
            <ListGroup>
                {sortedClues.map((clue) => (
                    <div>
                        <PlotItem key={clue.tableOfContentId} clue={clue} />
                    </div>
                ))}
            </ListGroup>
        </div>
    );
};
