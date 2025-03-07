import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { EventSetting, getEventSettingsModule } from 'modules/admin';
import { updateStringSetting } from 'modules/admin/settings/service';

import { AchievementSetting } from './AchievementSetting';
import { AchievementConfigurationButton } from './AchievementConfigurationButton';
import { TanstackTable } from '../../../../shared/TanstackTable';

// Settings for automatically unlocking specific achievements
const PulseAchievementSetting = 'PulseAchievement';
const PhotoPulseAchievementSetting = 'PhotoPulseAchievement';
const RatePuzzleAchievementSetting = 'RatePuzzleAchievement';

// TODO: Is this type defined elsewhere?
type AchievementSetting = {
    settingName: string;
    settingLabel: string;
    settingValue?: EventSetting;
};

export const AchievementsTable = () => {
    const settingsModule = useSelector(getEventSettingsModule);

    const achievementColumns: ColumnDef<AchievementSetting>[] = [
        {
            id: 'achievements',
            header: () => <h5>Achievement Settings</h5>,
            columns: [
                {
                    id: 'settingLabel',
                    accessorFn: (row) => row.settingLabel,
                    header: () => <span>Achievement Criteria</span>,
                },
                {
                    id: 'settingValue',
                    accessorFn: (row) => row.settingValue,
                    cell: (cell) => <AchievementSetting setting={cell.getValue()} />,
                    header: () => <span>Unlocked Achievement</span>,
                },
                {
                    id: 'configure',
                    header: () => <span>Configure</span>,
                    accessorFn: (row) => row,
                    cell: (cell) => {
                        return (
                            <AchievementConfigurationButton
                                achievementName={cell.getValue().settingLabel}
                                settingName={cell.getValue().settingName}
                                updateStringSetting={updateStringSetting}
                            />
                        );
                    },
                },
            ],
        },
    ];

    const achievementData: AchievementSetting[] = useMemo(
        () => [
            {
                settingName: PulseAchievementSetting,
                settingLabel: 'Pulse Achievement',
                settingValue: settingsModule.data.find((x) => x.name === PulseAchievementSetting),
            },
            {
                settingName: PhotoPulseAchievementSetting,
                settingLabel: 'Photo Pulse Achievement',
                settingValue: settingsModule.data.find((x) => x.name === PhotoPulseAchievementSetting),
            },
            {
                settingName: RatePuzzleAchievementSetting,
                settingLabel: 'Rate Clue Achievement',
                settingValue: settingsModule.data.find((x) => x.name === RatePuzzleAchievementSetting),
            },
        ],
        [settingsModule]
    );

    const achievementTable = useReactTable({
        data: achievementData,
        columns: achievementColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return <TanstackTable table={achievementTable} />;
};

export default AchievementsTable;
