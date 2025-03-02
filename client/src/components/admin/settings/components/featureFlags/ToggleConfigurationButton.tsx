import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { EventSetting } from 'modules/admin';
import { updateStringSetting as putStringSetting } from 'modules/admin/settings/service';

export const ToggleConfigurationButton = ({ settingName, previousValue }: { settingName: string; previousValue?: EventSetting }) => {
    const dispatch = useDispatch();
    const updateStringSetting = (settingType: string, settingName: string, settingValue: string) => dispatch(putStringSetting(settingType, settingName, settingValue));

    const [settingValue, setSettingValue] = useState<EventSetting | undefined>(previousValue);

    // The control may have been realized before the backing setting was loaded, so if previousValue ever changes
    // we'll update the component state to reflect that.
    useEffect(() => {
        setSettingValue(previousValue);
    }, [previousValue]);

    return (
        <Button
            onClick={() => {
                const newSettingStringValue = (!(settingValue?.stringValue === 'true')).toString();
                updateStringSetting('UserString', settingName, newSettingStringValue);
            }}
        >
            Toggle
        </Button>
    );
};
