import React from 'react';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';

import {
    useStaffAchievementsQuery,
    useTeamAchievementsQuery,
    useGrantAchievementMutation,
    useRevokeAchievementMutation,
} from 'modules/staff/achievements/queries';
import { Achievement } from 'modules/types';
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
    const { data: allAchievements = [] } = useStaffAchievementsQuery();
    const { data: unlockedAchievements = [], isLoading, isSuccess } = useTeamAchievementsQuery(teamId);
    const grantMutation = useGrantAchievementMutation();
    const revokeMutation = useRevokeAchievementMutation();

    const grantAchievement = (achievementId: string) => grantMutation.mutate({ teamId, achievementId });
    const revokeAchievement = (achievementId: string) => revokeMutation.mutate({ teamId, achievementId });

    if (isLoading && unlockedAchievements.length === 0) {
        return <div>Loading...</div>;
    } else if (isSuccess) {
        return (
            <div>
                <h5>Achievements</h5>
                <ListGroup>
                    {
                        allAchievements.map(achievement => 
                            <AchievementListItem
                                key={achievement.achievementId}
                                achievement={achievement}
                                grantAchievement={grantAchievement}
                                revokeAchievement={revokeAchievement}
                                isAchievementUnlocked={!!unlockedAchievements.find(x => x.achievementId === achievement.achievementId)}/>)
                    }
                </ListGroup>
            </div>
        );
    } else {
        return <div>An unknown error occured</div>
    }
}