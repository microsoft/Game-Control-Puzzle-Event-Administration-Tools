import { FaPlus } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

import DialogRenderProp from 'components/staff/dialogs/DialogRenderProp';
import SimpleListForm from 'components/staff/dialogs/SimpleListForm';
import { updateStringSetting as putStringSetting } from 'modules/admin/settings/service';
import { useStaffAchievements } from 'modules/staff/achievements';
import { Achievement } from 'modules/types';

import { updateStringSettingFunction } from '../../types';

export const AchievementConfigurationButton = ({
    achievementName,
    settingName,
}: {
    achievementName: string;
    settingName: string;
    updateStringSetting: updateStringSettingFunction;
}) => {
    const dispatch = useDispatch();
    const updateStringSetting = (settingType: string, settingName: string, settingValue: string) => dispatch(putStringSetting(settingType, settingName, settingValue));

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
