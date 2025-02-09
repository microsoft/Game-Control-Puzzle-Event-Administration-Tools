import { EventSetting } from 'modules/admin';
import { useStaffAchievements } from 'modules/staff/achievements';

type Props = Readonly<{
    setting?: EventSetting;
}>;

export const AchievementSetting = ({ setting }: Props) => {
    const { staffAchievementsModule } = useStaffAchievements();

    if (setting) {
        let achievement = staffAchievementsModule.data.find((x) => x.achievementId === setting.stringValue);

        if (achievement) {
            return <div>{achievement.name}</div>;
        } else {
            return <div>Cannot find achievement: {setting.stringValue}</div>;
        }
    } else {
        return <div>Setting not configured</div>;
    }
};
