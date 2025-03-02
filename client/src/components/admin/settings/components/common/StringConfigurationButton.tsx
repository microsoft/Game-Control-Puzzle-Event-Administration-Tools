import { useEffect, useState } from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import DialogRenderProp from 'components/staff/dialogs/DialogRenderProp';
import { updateStringSettingFunction } from '../../types';
import { updateStringSetting as putStringSetting } from 'modules/admin/settings/service';

type Props = Readonly<{ title: string; label: string; settingName: string; previousValue?: string }>;

export const StringConfigurationButton = ({ title, label, settingName, previousValue }: Props) => {
    const dispatch = useDispatch();
    const updateStringSetting = (settingType: string, settingName: string, settingValue: string) => dispatch(putStringSetting(settingType, settingName, settingValue));

    const [settingValue, setSettingValue] = useState(previousValue ?? '');

    // The control may have been realized before the backing setting was loaded, so if previousValue ever changes
    // we'll update the component state to reflect that.
    useEffect(() => {
        setSettingValue(previousValue ?? '');
    }, [previousValue]);

    return (
        <DialogRenderProp
            renderTitle={() => title}
            renderButton={() => 'Update'}
            renderBody={(onComplete: () => void) => (
                <div>
                    <FormGroup>
                        <Form.Label>{label}</Form.Label>
                        <Form.Control type="text" value={settingValue} maxLength={100} onChange={(event) => setSettingValue(event.target.value)} />
                    </FormGroup>
                    <Button
                        onClick={() => {
                            updateStringSetting('UserString', settingName, settingValue);
                            onComplete();
                        }}
                        disabled={settingValue?.length === 0}
                    >
                        Update
                    </Button>
                </div>
            )}
        />
    );
};
