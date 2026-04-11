import React from 'react';
import { Alert, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FaPlus, FaEdit } from 'react-icons/fa';

import DialogRenderProp from './dialogs/DialogRenderProp';
import { AchievementForm } from './dialogs';
import { AchievementItem } from '../shared/AchievementItem';

import { useStaffAchievementsQuery, useAddOrUpdateAchievementMutation } from "modules/staff/achievements/queries";
import { AchievementTemplate } from "modules/staff/achievements/models";
import { Achievement } from 'modules/types';
import { getErrorMessage } from 'lib/apiFetch';

type Props = Readonly<{
    achievements: Achievement[];
    isLoading: boolean;
    isSuccess: boolean;
    error: unknown;
    addAchievement: (achievement: AchievementTemplate) => void;
}>;

const AchievementsList = ({ achievements, isLoading, isSuccess, error, addAchievement }: Props) => {
    if (isLoading && achievements.length === 0) {
        return <div>Loading...</div>;
    } else if (!!error) {
        return <Alert variant="danger">{getErrorMessage(error)}</Alert>;
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
    const { data: achievements = [], isLoading, isSuccess, error } = useStaffAchievementsQuery();
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
            <AchievementsList achievements={achievements} isLoading={isLoading} isSuccess={isSuccess} error={error} addAchievement={addAchievement} />
        </div>
    );
};
