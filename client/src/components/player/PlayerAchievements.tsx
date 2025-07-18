import { ListGroup, ListGroupItem } from 'react-bootstrap';

import { AchievementItem } from '../shared/AchievementItem';
import { usePlayerAchievements } from 'modules/player/achievements';
import { Achievement } from 'modules/types';
import { usePlayerTakeOverClue } from 'modules/player';
import { Redirect } from 'react-router-dom';

export const PlayerAchievements = () => {
    const { achievementModule } = usePlayerAchievements();
    const takeOverClue = usePlayerTakeOverClue();

    if (takeOverClue) {
        return <Redirect to={`/player/clue/${takeOverClue.tableOfContentId}`} />
    } else if (achievementModule.lastFetched && achievementModule.data.length === 0) {
        return <h5>No Achievements Have Been Unlocked</h5>;
    } else if (achievementModule.isLoading && achievementModule.data.length === 0) {
        return <div>Loading...</div>;
    } else {
        return (
            <div>
                <h5>Achievements</h5>
                <ListGroup>
                    {achievementModule.data.map((achievement: Achievement) => 
                        <ListGroupItem key={achievement.achievementId}>
                            <AchievementItem achievement={achievement} dateText="Unlocked"/>
                        </ListGroupItem>
                    )}
                </ListGroup>
            </div>
        );
    }
};