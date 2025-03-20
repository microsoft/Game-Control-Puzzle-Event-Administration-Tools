import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useSelector } from 'react-redux';

import { StringConfigurationButton } from '../common/StringConfigurationButton';
import { ChallengesNamePluralSetting, ChallengesNameSingularSetting, PointsNameSetting } from 'modules/types';
import { getEventSettingsModule } from 'modules/admin';
import { TanstackTable } from '../../../../shared/TanstackTable';
import { useMemo } from 'react';

export const BrandSettingsTable = () => {
    const settingsModule = useSelector(getEventSettingsModule);

    const brandingColumns: ColumnDef<any>[] = [
        {
            id: 'branding',
            header: () => <h5>Branding Settings</h5>,
            columns: [
                {
                    id: 'settingLabel',
                    accessorFn: (row) => row.settingLabel,
                    header: () => <span>String Name</span>,
                },
                {
                    id: 'settingValue',
                    accessorFn: (row) => row.settingValue,
                    header: () => <span>Value</span>,
                    cell: (cell) => {
                        if (!cell.getValue()) {
                            return <div>Setting not configured</div>;
                        }

                        return <div>{cell.getValue().stringValue}</div>;
                    },
                },
                {
                    id: 'configure',
                    header: () => <span>Configure</span>,
                    accessorFn: (row) => row,
                    cell: (cell) => {
                        return (
                            <StringConfigurationButton
                                title={`Configure String for ${cell.getValue().defaultValue}`}
                                label={`Both administrators and players will see this string instead of the default '${cell.getValue().defaultValue}'`}
                                settingName={cell.getValue().settingName}
                                previousValue={cell.getValue().settingValue?.stringValue}
                            />
                        );
                    },
                },
            ],
        },
    ];

    const brandingData = useMemo(
        () => [
            {
                settingName: ChallengesNameSingularSetting,
                settingLabel: 'Name for Challenge (Singular)',
                settingValue: settingsModule.data.find((x) => x.name === ChallengesNameSingularSetting),
                defaultValue: 'Challenge',
            },
            {
                settingName: ChallengesNamePluralSetting,
                settingLabel: 'Name for Challenges (Plural)',
                settingValue: settingsModule.data.find((x) => x.name === ChallengesNamePluralSetting),
                defaultValue: 'Challenges',
            },
            {
                settingName: PointsNameSetting,
                settingLabel: 'Name for Points',
                settingValue: settingsModule.data.find((x) => x.name === PointsNameSetting),
                defaultValue: 'Points',
            },
        ],
        [settingsModule]
    );

    const brandingTable = useReactTable({
        data: brandingData,
        columns: brandingColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return <TanstackTable table={brandingTable} />;
};
