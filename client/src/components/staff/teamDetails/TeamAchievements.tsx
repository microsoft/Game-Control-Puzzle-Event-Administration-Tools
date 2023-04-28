import React from 'react';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';

import { useStaffAchievements, useAchievementUnlocks } from "modules/staff/achievements";
import { Achievement } from "modules/types";
import { AchievementItem } from '../../shared/AchievementItem';

type AchievementProps = Readonly<{
    achievement: Achievement;
    isAchievementUnlocked: boolean;
    grantAchievement: (achievementId: string) => void;
    revokeAchievement: (achievementId: string) => void;
}>;

const AchievementListItem = ({ achievement, isAchievementUnlocked, grantAchievement, revokeAchievement }: AchievementProps) => {
    return (
        <ListGroupItem 
            key={achievement.achievementId}
            variant={isAchievementUnlocked ? 'success' : undefined}>
            <AchievementItem achievement={achievement} dateText='Created'/>
            {isAchievementUnlocked ?
                <Button onClick={() => revokeAchievement(achievement.achievementId)}>
                    Revoke
                </Button>
                :
                <Button onClick={() => grantAchievement(achievement.achievementId)}>
                    Grant
                </Button>
            }
        </ListGroupItem>
    );
}

type Props = Readonly<{
    teamId: string;
}>;

export const TeamAchievements = ({ teamId }: Props) => {
    const { staffAchievementsModule } = useStaffAchievements();
    const { unlockedAchievementsModule, grantAchievement, revokeAchievement } = useAchievementUnlocks(teamId);

    if (!unlockedAchievementsModule) {
        return <div>Achievement data unavailable.</div>
    } else if (unlockedAchievementsModule.isLoading && unlockedAchievementsModule.data.length === 0) {
        return <div>Loading...</div>;
    } else if (unlockedAchievementsModule.data && staffAchievementsModule.data) {
        return (
            <div>
                <h5>Achievements</h5>
                <ListGroup>
                    {
                        staffAchievementsModule.data.map(achievement => 
                            <AchievementListItem
                                key={achievement.achievementId}
                                achievement={achievement}
                                grantAchievement={grantAchievement}
                                revokeAchievement={revokeAchievement}
                                isAchievementUnlocked={!!unlockedAchievementsModule?.data.find(x => x.achievementId === achievement.achievementId)}/>)
                    }
                </ListGroup>
            </div>
        );
    } else {
        return <div>An unknown error occured</div>
    }
}