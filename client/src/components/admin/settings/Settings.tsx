import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { EventSetting } from 'modules/admin';
import { fetchEventSettings, updateStringSetting as putStringSetting } from 'modules/admin/settings/service';

import './Settings.css';
import { getEventName } from 'modules';

import AchievementsTable from './components/achievements/AchievementsTable';
import { BrandSettingsTable } from './components/brand/BrandTable';
import { FeatureFlagTable } from './components/featureFlags/FeatureFlagTable';

type Setting = Readonly<{
    settingName: string;
    settingLabel: string;
    settingValue: EventSetting | undefined;
}>;

export const Settings = () => {
    const eventName = useSelector(getEventName);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchEventSettings());
    }, [dispatch]);

    const navTabData = [];

    return (
        <div>
            <br />
            <h4>Instance-Specific configuration for {eventName}</h4>

            <AchievementsTable />

            <BrandSettingsTable />

            <FeatureFlagTable />
        </div>
    );
};
