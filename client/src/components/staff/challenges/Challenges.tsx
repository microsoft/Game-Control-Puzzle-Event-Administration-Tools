import { Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import DialogRenderProp from '../dialogs/DialogRenderProp';
import { ChallengeForm } from '../dialogs/ChallengeForm';
import { useStaffChallengesQuery, useAddOrUpdateChallengeMutation } from 'modules/staff/challenges/queries';
import { getChallengePluralNameSetting, getChallengeSingularNameSetting, getPointsNameSetting } from 'modules';
import { getErrorMessage } from 'lib/apiFetch';

import { ChallengesList as TanstackList } from './components/ChallengesList';

export const Challenges = () => {
    const challengePluralName = useSelector(getChallengePluralNameSetting);
    const challengeSingularName = useSelector(getChallengeSingularNameSetting);
    const pointsNameSetting = useSelector(getPointsNameSetting);
    const { data: challenges = [], isLoading, error } = useStaffChallengesQuery();
    const addOrUpdateChallenge = useAddOrUpdateChallengeMutation();

    document.title = `Game Control - ${challengePluralName}`;

    return (
        <div>
            <h5>
                {challengePluralName}
                &nbsp;
                <DialogRenderProp
                    renderTitle={() => `Add New ${challengeSingularName}`}
                    renderButton={() => <FaPlus />}
                    renderBody={(onComplete: any) => <ChallengeForm pointsName={pointsNameSetting} onSubmit={(c) => addOrUpdateChallenge.mutate(c)} onComplete={onComplete} />}
                />
            </h5>

            {!!error && <Alert variant="danger">{getErrorMessage(error)}</Alert>}

            {isLoading && <Alert variant="info">Loading...</Alert>}

            <TanstackList challenges={challenges} />
        </div>
    );
};
