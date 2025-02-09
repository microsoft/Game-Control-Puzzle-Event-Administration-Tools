import { FaPlus } from 'react-icons/fa';

import DialogRenderProp from 'components/staff/dialogs/DialogRenderProp';
import SimpleListForm from 'components/staff/dialogs/SimpleListForm';
import { useStaffAchievements } from 'modules/staff/achievements';
import { Achievement } from 'modules/types';

import { updateStringSettingFunction } from '../../types';

type Props = Readonly<{
    achievementName: string;
    settingName: string;
    updateStringSetting: updateStringSettingFunction;
}>;

export const AchievementConfigurationButton = ({ achievementName, settingName, updateStringSetting }: Props) => {
    const { staffAchievementsModule } = useStaffAchievements();

    return (
        <DialogRenderProp
            renderTitle={() => `Configure ${achievementName}`}
            renderButton={() => (
                <>
                    <FaPlus /> Configure
                </>
            )}
            renderBody={(onComplete: () => void) => (
                <SimpleListForm
                    label={'Select an achievement'}
                    submitText="Configure"
                    collection={staffAchievementsModule.data}
                    getItemKey={(achievement: Achievement) => achievement.achievementId}
                    getItemValue={(achievement: Achievement) => achievement.achievementId}
                    getItemLabel={(achievement: Achievement) => achievement.name}
                    onSubmit={(achievementId: string) => {
                        updateStringSetting('String', settingName, achievementId);
                        onComplete();
                    }}
                />
            )}
        />
    );
};
