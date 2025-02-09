import { Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import DialogRenderProp from '../dialogs/DialogRenderProp';
import { ChallengeForm } from '../dialogs/ChallengeForm';
import { useStaffChallenges } from 'modules/staff/challenges';
import { getChallengePluralNameSetting, getChallengeSingularNameSetting, getPointsNameSetting } from 'modules';

import { ChallengesList as TanstackList } from './components/ChallengesList';

export const Challenges = () => {
    const challengePluralName = useSelector(getChallengePluralNameSetting);
    const challengeSingularName = useSelector(getChallengeSingularNameSetting);
    const pointsNameSetting = useSelector(getPointsNameSetting);
    const { challengesModule, addChallenge } = useStaffChallenges();

    document.title = `Game Control - ${challengePluralName}`;

    return (
        <div>
            <h5>
                {challengePluralName}
                &nbsp;
                <DialogRenderProp
                    renderTitle={() => `Add New ${challengeSingularName}`}
                    renderButton={() => <FaPlus />}
                    renderBody={(onComplete: any) => <ChallengeForm pointsName={pointsNameSetting} onSubmit={addChallenge} onComplete={onComplete} />}
                />
            </h5>

            {!!challengesModule.lastError && <Alert variant="danger">{challengesModule.lastError}</Alert>}

            {!!challengesModule.isLoading && <Alert variant="info">Loading...</Alert>}

            <TanstackList challengesModule={challengesModule} />
        </div>
    );
};
