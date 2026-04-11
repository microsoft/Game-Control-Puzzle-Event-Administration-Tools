import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { FaPlus, FaEdit } from 'react-icons/fa';

import DialogRenderProp from './dialogs/DialogRenderProp';
import { AchievementForm } from './dialogs';
import { AchievementItem } from '../shared/AchievementItem';

import { useStaffAchievementsQuery, useAddOrUpdateAchievementMutation } from "modules/staff/achievements/queries";
import { AchievementTemplate } from "modules/staff/achievements/models";
import { Achievement } from 'modules/types';

type Props = Readonly<{
    achievements: Achievement[];
    isLoading: boolean;
    isSuccess: boolean;
    addAchievement: (achievement: AchievementTemplate) => void;
}>;

const AchievementsList = ({ achievements, isLoading, isSuccess, addAchievement }: Props) => {
    if (isLoading) {
        return <div>Loading...</div>;
    } else if (isSuccess && achievements.length === 0) {
        return <div>There are no achievements for this event</div>;
    } else if (achievements.length > 0) {
        return <ListGroup>
                {achievements.map(achievement => 
                    <ListGroupItem key={achievement.achievementId}>
                        <AchievementItem achievement={achievement} dateText="Created"/>
                        <DialogRenderProp
                            renderTitle={() => `Edit Achievement: ${achievement.name}`}
                            renderButton={() => <FaEdit/>}
                            renderBody={(onComplete: any) =>
                                <AchievementForm
                                    achievement={achievement}
                                    onSubmit={addAchievement}
                                    onComplete={onComplete}/>
                            }
                        />
                    </ListGroupItem>
                )}
            </ListGroup>
    } else {
        return <div>Could not load achievements...</div>;
    }
}

export const StaffAchievements = () => {
    document.title = "Game Control - Achievements";
    const { data: achievements = [], isLoading, isSuccess } = useStaffAchievementsQuery();
    const addAchievementMutation = useAddOrUpdateAchievementMutation();
    const addAchievement = (achievement: AchievementTemplate) => addAchievementMutation.mutate(achievement);

    return (
        <div>
            <h5>
                Achievements
                &nbsp;
                <DialogRenderProp
                    renderTitle={() => "Add New Achievement"}
                    renderButton={() => <FaPlus/>}
                    renderBody={(onComplete: any) =>
                        <AchievementForm
                            onSubmit={addAchievement}
                            onComplete={onComplete}/>
                    }
                />
            </h5>
            <AchievementsList achievements={achievements} isLoading={isLoading} isSuccess={isSuccess} addAchievement={addAchievement} />
        </div>
    );
};
