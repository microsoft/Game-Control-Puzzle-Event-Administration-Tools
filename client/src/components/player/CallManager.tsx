import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Card, Button, Row } from 'react-bootstrap';
import { FaPuzzlePiece, FaQuestionCircle } from 'react-icons/fa';

import { getAllPlayerPuzzles, getPointsNameSetting, getShowCallManagerSetting } from 'modules';
import { usePlayerCalls } from 'modules/player/calls';
import { fetchPlayerClues } from 'modules/player/clues/service';
import { useTeamData } from 'modules/player/team/hooks';
import { PlayerActiveCall } from './PlayerActiveCall';
import { PlayerClue } from 'modules/player';

export const CallManager = () => {
    const { playerCalls, updateCall } = usePlayerCalls();
    const { teamModule } = useTeamData();
    const allPuzzles = useSelector(getAllPlayerPuzzles);
    const pointsName = useSelector(getPointsNameSetting);

    const showCallManager = useSelector(getShowCallManagerSetting);

    const unsolvedPuzzles = allPuzzles.filter((clue: PlayerClue) => clue.submissionTime === null && clue.submittableType.trim() !== 'Plot');

    useEffect(() => {
        fetchPlayerClues();
    }, []);

    if (showCallManager) {
        if (playerCalls.data && playerCalls.data.length > 0) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <Card className="playerActiveCallCard">
                        <Card.Header>Active Call with Game Control</Card.Header>
                        <Card.Body>
                            <PlayerActiveCall currentCall={playerCalls.data[0]} onUpdate={updateCall} />
                        </Card.Body>
                    </Card>
                </div>
            );
        } else {
            return (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {(!unsolvedPuzzles || unsolvedPuzzles.length === 0) && (
                        <Button variant="outline-info" className="playerCallButton" onClick={() => updateCall({ callType: 'TeamFree' })}>
                            <div className="playerCallButtonIcon">
                                <FaPuzzlePiece />
                            </div>
                            <div>Request New Puzzles</div>
                        </Button>
                    )}
                    {
                        <Button variant="outline-warning" className="playerCallButton" onClick={() => updateCall({ callType: 'TeamHelp' })}>
                            <div className="playerCallButtonIcon">
                                <FaQuestionCircle />
                            </div>
                            <div>Request Help</div>
                        </Button>
                    }
                    {/*
                    <Card style={{ width: '175px', margin: "10px" }}>
                        <Card.Header>Current {pointsName}</Card.Header>
                        <Card.Body>{teamModule.data.points}</Card.Body>
                    </Card>
                */}
                </div>
            );
        }
    } else {
        return <div></div>;
    }
};
