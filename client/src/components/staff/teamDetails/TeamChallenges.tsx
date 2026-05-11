import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Challenge } from 'modules/staff/challenges';
import { useStaffChallengesQuery } from 'modules/staff/challenges/queries';

const ChallengeRow = ({ challenge, teamId }: { challenge: Challenge; teamId: string }) => {
    let variant = undefined;

    for (let submission of challenge.submissions) {
        if (submission.teamId === teamId) {
            if (submission.state === 1) {
                variant = 'success';
            } else if (!variant && submission.state === 2) {
                variant = 'danger';
            } else if (!variant && submission.state === 0) {
                variant = 'warning';
            }
        }
    }

    return (
        <LinkContainer key={challenge.challengeId} to={`/staff/challenges/${challenge.challengeId}`}>
            <ListGroupItem variant={variant}>
                {challenge.title}
                <br />
                <small>{challenge.description}</small>
            </ListGroupItem>
        </LinkContainer>
    );
};

const ChallengesContent = ({ challenges, teamId }: { challenges: Challenge[]; teamId: string }) => {
    return (
        <ListGroup>
            {challenges.map((challenge) => (
                <ChallengeRow key={challenge.challengeId} teamId={teamId} challenge={challenge} />
            ))}
        </ListGroup>
    );
};

export const TeamChallenges = ({ teamId }: { teamId: string }) => {
    const { data: challenges = [], isLoading } = useStaffChallengesQuery();

    return (
        <div>
            <h5>Challenges</h5>
            {isLoading && <div>Loading...</div>}
            {challenges.length > 0 && <ChallengesContent challenges={challenges} teamId={teamId} />}
        </div>
    );
};
