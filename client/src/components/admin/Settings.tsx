import { useEffect, useState } from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';
import BootstrapTable, { ColumnDescription } from 'react-bootstrap-table-next';
import { FaPlus } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';

import { EventSetting, getEventSettingsModule } from 'modules/admin';
import { fetchEventSettings, updateStringSetting as putStringSetting } from "modules/admin/settings/service";
import { useStaffAchievements } from 'modules/staff/achievements';
import { Achievement, ChallengesNamePluralSetting, ChallengesNameSingularSetting, PointsNameSetting } from "modules/types";

import DialogRenderProp from '../staff/dialogs/DialogRenderProp';
import SimpleListForm from '../staff/dialogs/SimpleListForm';

import "./Settings.css";
import { getEventName } from 'modules';

// Settings for automatically unlocking specific achievements
const PulseAchievementSetting      = "PulseAchievement";
const PhotoPulseAchievementSetting = "PhotoPulseAchievement";
const RatePuzzleAchievementSetting = "RatePuzzleAchievement";

type updateStringSettingFunction = (settingType: string, settingName: string, settingValue: string) => void;

const AchievementSetting = ({ setting }: { setting?: EventSetting }) => {
    const { staffAchievementsModule } = useStaffAchievements();

    if (setting) {                   
        let achievement = staffAchievementsModule.data.find(x => x.achievementId === setting.stringValue);

        if (achievement) {
            return <div>{achievement.name}</div>
        } else {
            return <div>Cannot find achievement: {setting.stringValue}</div>;
        }
    } else {
        return <div>Setting not configured</div>
    }
};

const AchievementConfigurationButton = ({ achievementName, settingName, updateStringSetting }: { achievementName: string, settingName: string, updateStringSetting: updateStringSettingFunction}) => {
    const { staffAchievementsModule } = useStaffAchievements();

    return (
        <DialogRenderProp
            renderTitle={() => `Configure ${achievementName}`}
            renderButton={() => <><FaPlus/> Configure</>}
            renderBody={(onComplete: () => void) => 
                <SimpleListForm
                    label={"Select an achievement"}
                    submitText="Configure"
                    collection={staffAchievementsModule.data}
                    getItemKey={(achievement: Achievement) => achievement.achievementId}
                    getItemValue={(achievement: Achievement) => achievement.achievementId}
                    getItemLabel={(achievement: Achievement) => achievement.name}
                    onSubmit={(achievementId: string) => {
                        updateStringSetting("String", settingName, achievementId);
                        onComplete();
                    }}
                />
            }
        />
    );
};

const StringConfigurationButton = ({ title, label, settingName, previousValue, updateStringSetting } : { title: string, label: string, settingName: string, previousValue?: string, updateStringSetting: updateStringSettingFunction }) => {
    const [settingValue, setSettingValue] = useState(previousValue ?? "");

    // The control may have been realized before the backing setting was loaded, so if previousValue ever changes
    // we'll update the component state to reflect that.
    useEffect(() => {
        setSettingValue(previousValue ?? "");
    }, [previousValue]);
    
    return (
        <DialogRenderProp
            renderTitle={() => title}
            renderButton={() => "Update"}
            renderBody={(onComplete: () => void) =>
                <div>
                    <FormGroup>
                        <Form.Label>{label}</Form.Label>
                        <Form.Control
                            type="text"
                            value={settingValue}
                            maxLength={100}
                            onChange={event => setSettingValue(event.target.value)}
                        />
                    </FormGroup>
                    <Button
                        onClick={() => {
                            updateStringSetting("UserString", settingName, settingValue);
                            onComplete();
                        }}
                        disabled={settingValue?.length === 0}>
                        Update
                    </Button>
                </div>
            }
        />
    );
};

export const Settings = () => {
    const settingsModule = useSelector(getEventSettingsModule);
    const eventName = useSelector(getEventName);
    const dispatch = useDispatch();
    const updateStringSetting = (settingType: string, settingName: string, settingValue: string) => dispatch(putStringSetting(settingType, settingName, settingValue));
    
    useEffect(() => {
        dispatch(fetchEventSettings());
    }, [dispatch]);

    const achievementColumns: ColumnDescription[] = [
        {
            dataField: 'settingLabel',
            text: 'Achievement Criteria'
        },
        {
            dataField: 'settingValue',
            text: 'Unlocked Achievement',
            formatter: (cell, row) => {
                return <AchievementSetting setting={cell}/>
            }
        },
        {
            dataField: 'button',
            text: 'Configure',
            formatter: (cell, row) => {
                return (
                    <AchievementConfigurationButton
                        achievementName={row.achievement}
                        settingName={row.settingName}
                        updateStringSetting={updateStringSetting}
                    />
                );
            }
        }
    ];

    const achievementData = [
        {
            settingName: PulseAchievementSetting,
            settingLabel: "Pulse Achievement",
            settingValue: settingsModule.data.find(x => x.name === PulseAchievementSetting)
        },
        {
            settingName: PhotoPulseAchievementSetting,
            settingLabel: "Photo Pulse Achievement",
            settingValue: settingsModule.data.find(x => x.name === PhotoPulseAchievementSetting)
        },
        {
            settingName: RatePuzzleAchievementSetting,
            settingLabel: "Rate Clue Achievement",
            settingValue: settingsModule.data.find(x => x.name === RatePuzzleAchievementSetting)
        }
    ];

    const brandingColumns: ColumnDescription[] = [
        {
            dataField: 'settingLabel',
            text: 'String Name',
        },
        {
            dataField: 'settingValue',
            text: 'Value',
            formatter: (cell, row) => {
                if (!cell) {
                    return <div>Setting not configured</div>
                }

                return <div>{cell.stringValue}</div>
            }
        },
        {
            dataField: 'button',
            text: 'Configure',
            formatter: (cell, row) => {
                return <StringConfigurationButton 
                    title={`Configure String for ${row.defaultValue}`}
                    label={`Both administrators and players will see this string instead of the default '${row.defaultValue}'`}
                    settingName={row.settingName}
                    previousValue={row.settingValue}
                    updateStringSetting={updateStringSetting}    
                />        
            }
        }
    ];

    const brandingData = [
        {
            settingName: ChallengesNameSingularSetting,
            settingLabel: "Name for Challenge (Singular)",
            settingValue: settingsModule.data.find(x => x.name === ChallengesNameSingularSetting),
            defaultValue: "Challenge"
        },
        {
            settingName: ChallengesNamePluralSetting,
            settingLabel: "Name for Challenges (Plural)",
            settingValue: settingsModule.data.find(x => x.name === ChallengesNamePluralSetting),
            defaultValue: "Challenges"
        },
        {
            settingName: PointsNameSetting,
            settingLabel: "Name for Points",
            settingValue: settingsModule.data.find(x => x.name === PointsNameSetting),
            defaultValue: "Points"
        }
    ];

    return (
        <div>
            <br/>
            <h4>Instance-Specific configuration for {eventName}</h4>

            <h5>Achievement-related Settings</h5>
            <BootstrapTable
                columns={achievementColumns}
                data={achievementData}
                keyField="settingName"
            />

            <h5>Branding Settings</h5>
            <BootstrapTable
                columns={brandingColumns}
                data={brandingData}
                keyField="settingName"
            />
        </div>
    );
};
