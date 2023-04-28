import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { FaPlus, FaEdit } from 'react-icons/fa';

import DialogRenderProp from './dialogs/DialogRenderProp';
import { AchievementForm } from './dialogs';
import { AchievementItem } from '../shared/AchievementItem';

import { useStaffAchievements, AchievementTemplate } from "modules/staff/achievements";
import { Achievement, Module } from 'modules/types';

type Props = Readonly<{
    staffAchievementsModule: Module<Achievement[]>;
    addAchievement: (achievement: AchievementTemplate) => void;
}>;

const AchievementsList = ({ staffAchievementsModule, addAchievement }: Props) => {
    if (staffAchievementsModule.isLoading) {
        return <div>Loading...</div>;
    } else if (staffAchievementsModule.lastFetched && staffAchievementsModule.data.length === 0) {
        return <div>There are no achievements for this event</div>;
    } else if (staffAchievementsModule.data.length > 0) {
        return <ListGroup>
                {staffAchievementsModule.data.map(achievement => 
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
    const { staffAchievementsModule, addAchievement } = useStaffAchievements();

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
            <AchievementsList staffAchievementsModule={staffAchievementsModule} addAchievement={addAchievement} />
        </div>
    );
};
