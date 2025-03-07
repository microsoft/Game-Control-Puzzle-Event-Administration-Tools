import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getEventSettingsModule } from 'modules/admin';
import { ShowAchievementsSetting, ShowActivitySetting, ShowCallManagerSetting, ShowChallengesSetting, ShowInboxSetting, ShowPulseSetting } from 'modules/types';

import { ToggleConfigurationButton } from './ToggleConfigurationButton';
import { TanstackTable } from '../../../../shared/TanstackTable';

export const FeatureFlagTable = () => {
    const settingsModule = useSelector(getEventSettingsModule);

    const featureFlagColumns: ColumnDef<any>[] = [
        {
            id: 'featureFlags',
            header: () => <h5>Feature Flags</h5>,
            columns: [
                {
                    id: 'settingLabel',
                    accessorFn: (row) => row.settingLabel,
                    header: () => <span>Show Column</span>,
                },
                {
                    id: 'settingValue',
                    accessorFn: (row) => row,
                    header: () => <span>Value</span>,
                    cell: (cell) => {
                        if (!cell.getValue().settingValue?.stringValue) {
                            return <div>{cell.getValue().defaultValue.toString()}</div>;
                        }

                        return <div>{cell.getValue().settingValue.stringValue}</div>;
                    },
                },
                {
                    id: 'configure',
                    header: () => <span>Configure</span>,
                    accessorFn: (row) => row,
                    cell: (cell) => {
                        return <ToggleConfigurationButton settingName={cell.getValue().settingName} previousValue={cell.getValue().settingValue} />;
                    },
                },
            ],
        },
    ];

    const featureFlagData = useMemo(
        () => [
            {
                settingName: ShowPulseSetting,
                settingLabel: 'Pulse',
                settingValue: settingsModule.data.find((x) => x.name === ShowPulseSetting),
                defaultValue: 'true',
            },
            {
                settingName: ShowInboxSetting,
                settingLabel: 'Inbox',
                settingValue: settingsModule.data.find((x) => x.name === ShowInboxSetting),
                defaultValue: 'true',
            },
            {
                settingName: ShowActivitySetting,
                settingLabel: 'Activity',
                settingValue: settingsModule.data.find((x) => x.name === ShowActivitySetting),
                defaultValue: 'true',
            },
            {
                settingName: ShowAchievementsSetting,
                settingLabel: 'Achievement',
                settingValue: settingsModule.data.find((x) => x.name === ShowAchievementsSetting),
                defaultValue: 'true',
            },
            {
                settingName: ShowChallengesSetting,
                settingLabel: 'Challenges',
                settingValue: settingsModule.data.find((x) => x.name === ShowChallengesSetting),
                defaultValue: 'true',
            },
            {
                settingName: ShowCallManagerSetting,
                settingLabel: 'Call Manager',
                settingValue: settingsModule.data.find((x) => x.name === ShowCallManagerSetting),
                defaultValue: 'true',
            },
        ],
        [settingsModule]
    );

    const featureFlagTable = useReactTable({
        data: featureFlagData,
        columns: featureFlagColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return <TanstackTable table={featureFlagTable} />;
};
