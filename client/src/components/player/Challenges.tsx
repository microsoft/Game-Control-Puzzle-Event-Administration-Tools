import { useSelector } from 'react-redux';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import moment from 'moment';
import 'moment-timezone';

import { Module } from 'modules/types';
import { getChallengePluralNameSetting, getChallengeSingularNameSetting } from 'modules';
import { PlayerChallenge } from 'modules/player/challenges/models';
import { usePlayerChallenges } from 'modules/player/challenges/hooks';

const isChallengeExpired = (challenge: any) => challenge.endTime === undefined || moment.utc().diff(moment.utc(challenge.endTime)) > 0;

const isChallengeCompleted = (challenge: any) => challenge.submissions.find((x: any) => x.state === 1) !== undefined;

const isChallengeAwaitingReview = (challenge: any) => challenge.submissions.find((x: any) => x.state === 0) !== undefined;

const ChallengeRow = ({ challenge }: { challenge: any }) => {
    const challengesSingularName = useSelector(getChallengeSingularNameSetting);

    let tag = '';
    let color: 'success' | 'warning' | 'danger' | undefined = undefined;
    if (isChallengeCompleted(challenge)) {
        tag = ' (Completed)';
        color = 'success';
    } else if (isChallengeAwaitingReview(challenge)) {
        tag = ' (Awaiting Review)';
        color = 'warning';
    } else if (isChallengeExpired(challenge)) {
        tag = ' (Expired)';
        color = 'danger';
    }

    return (
        <LinkContainer key={challenge.challengeId} to={`/player/challenges/${challenge.challengeId}`}>
            <ListGroupItem variant={color}>
                <>
                    <div>
                        <h5>
                            {challenge.title}
                            {tag}
                        </h5>
                    </div>
                    <div>{challenge.description}</div>
                </>
                <div>
                    {!!challenge.endTime ? (
                        moment.utc().diff(moment.utc(challenge.endTime)) > 0 ? null : (
                            <small>
                                This {challengesSingularName} is available until {moment.utc(challenge.endTime).local().format('MM-DD HH:mm')}
                            </small>
                        )
                    ) : null}
                </div>
            </ListGroupItem>
        </LinkContainer>
    );
};

export const Challenges = () => {
    const challengesPluralName = useSelector(getChallengePluralNameSetting);
    const { challengesModule } = usePlayerChallenges();

    document.title = challengesPluralName;

    const _renderChallengeModule = (challengeModule: Module<PlayerChallenge[]>) => {
        if (challengeModule.data.length > 0) {
            const completed = challengeModule.data.filter((x: any) => isChallengeCompleted(x)).sort((a: any, b: any) => a.title.localeCompare(b.title));
            const warning = challengeModule.data.filter((x: any) => isChallengeAwaitingReview(x)).sort((a: any, b: any) => a.title.localeCompare(b.title));
            const expired = challengeModule.data.filter((x: any) => isChallengeExpired(x)).sort((a: any, b: any) => a.title.localeCompare(b.title));
            const active = challengeModule.data
                .filter((x: any) => !isChallengeExpired(x) && !isChallengeAwaitingReview(x) && !isChallengeCompleted(x))
                .sort((a: any, b: any) => a.title.localeCompare(b.title));

            let challenges = [...active, ...warning, ...completed, ...expired];

            return (
                <ListGroup className="clickable">
                    {challenges.map((challenge) => (
                        <ChallengeRow key={challenge.challengeId} challenge={challenge} />
                    ))}
                </ListGroup>
            );
        } else if (challengeModule.isLoading) {
            return <div>Loading...</div>;
        } else {
            return <div>No {challengesPluralName} are currently available. Please check back later</div>;
        }
    };

    return (
        <div>
            <h2>{challengesPluralName}</h2>
            {_renderChallengeModule(challengesModule)}
        </div>
    );
};
