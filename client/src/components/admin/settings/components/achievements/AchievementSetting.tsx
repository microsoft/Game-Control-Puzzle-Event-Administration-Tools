import { EventSetting } from 'modules/admin';
import { useStaffAchievementsQuery } from 'modules/staff/achievements/queries';

type Props = Readonly<{
    setting?: EventSetting;
}>;

export const AchievementSetting = ({ setting }: Props) => {
    const { data: achievements = [] } = useStaffAchievementsQuery();

    if (setting) {
        let achievement = achievements.find((x) => x.achievementId === setting.stringValue);

        if (achievement) {
            return <div>{achievement.name}</div>;
        } else {
            return <div>Cannot find achievement: {setting.stringValue}</div>;
        }
    } else {
        return <div>Setting not configured</div>;
    }
};
