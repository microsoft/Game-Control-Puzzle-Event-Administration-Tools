import React from 'react';
import { Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { FaRegAngry, FaSadTear, FaRegMeh, FaSmile, FaRegSmileBeam, FaGift, FaQuestionCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import * as constants from '../../constants';
import { getStaffFeed } from 'modules/staff/feed/service';
import { Module } from 'modules/types';
import { AggregatedContent } from 'modules/types/models';
import { getFeedModule } from 'modules/staff';
import { useInterval } from 'utils/hooks';

import { PointsFeedItem } from '../player/PlayerFeed';

type FeedItemProps = Readonly<{
    feedItem: AggregatedContent;
}>;

const AbstractFeedItem = ({ feedItem }: FeedItemProps) => {
    switch (feedItem.aggregatedContentType.trim()) {
        case 'Pulse':
            return <PulseFeedItem feedItem={feedItem} />;
        case 'Submission':
            return <SubmissionFeedItem feedItem={feedItem} />;
        case 'Skip':
            return <SkipFeedItem feedItem={feedItem} />;
        case 'GcUnlock':
            return <GcUnlockFeedItem feedItem={feedItem} />;
        case 'Answer':
            return <TeamUnlockFeedItem feedItem={feedItem} />;
        case 'GcMessage':
            return <GcMessageFeedItem feedItem={feedItem} />;
        case 'CallStarted':
            return <CallStartedFeedItem feedItem={feedItem} />;
        case 'CallEnded':
            return <CallEndedFeedItem feedItem={feedItem} />;
        case 'AchievementUnlock':
            return <AchievementFeedItem feedItem={feedItem} />;
        case 'ChallengeSubmission':
            return <ChallengeFeedItem feedItem={feedItem} />;
        case 'PointsAward':
            return <PointsFeedItem feedItem={feedItem} />;
        default:
            return <UnknownFeedItem feedItem={feedItem} />;
    }
};

const UnknownFeedItem = ({ feedItem }: FeedItemProps) => {
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div>{feedItem.description}</div>
                    <div>
                        <strong>Unhandled activity feed type.</strong>
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>{feedItem.aggregatedContentType}</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const AchievementFeedItem = ({ feedItem }: FeedItemProps) => {
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div>
                        <strong>{feedItem.teamName}</strong> unlocked <strong>{feedItem.description}</strong>
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>Achievement</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const ChallengeFeedItem = ({ feedItem }: FeedItemProps) => {
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div>{feedItem.description}</div>
                    <div>
                        <small>Submitted By by {feedItem.teamName}</small>
                    </div>
                    {feedItem.hasAdditionalImage && <img alt="Challenge Pic" src={`${constants.APPLICATION_URL}api/content/challengePic/${feedItem.id}`} />}
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>Challenge Submission</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const PulseFeedItem = ({ feedItem }: FeedItemProps) => {
    let sentiment = null;
    switch (feedItem.numericValue) {
        case 1:
            sentiment = <FaRegAngry size="32px" />;
            break;
        case 2:
            sentiment = <FaSadTear size="32px" />;
            break;
        case 3:
            sentiment = <FaRegMeh size="32px" />;
            break;
        case 4:
            sentiment = <FaSmile size="32px" />;
            break;
        case 5:
            sentiment = <FaRegSmileBeam size="32px" />;
            break;
    }

    if (sentiment !== null) {
        sentiment = <span className="mr-3">{sentiment}</span>;
    }

    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div>
                        {sentiment}
                        {feedItem.description}
                    </div>
                    <div>
                        <small>Pulsed by {feedItem.teamName}</small>
                    </div>
                    {feedItem?.hasAdditionalImage === 1 && (
                        <a href={`${constants.APPLICATION_URL}api/content/pulsePic/${feedItem.id}`}>
                            <img alt="Player Pulse Pic" src={`${constants.APPLICATION_URL}api/content/pulseThumb/${feedItem.id}`} />
                        </a>
                    )}
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>Pulse</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const parseCall = (feedItem: AggregatedContent, started: boolean) => {
    let callType = 'Call to Game Control';
    let originator = `${feedItem.teamName} (${feedItem.description})`;
    let message = `${feedItem.teamName} ${started ? 'began' : 'ended'} a call with Game Control (${feedItem.description})`;
    let icon = null;
    switch (feedItem.numericValue) {
        case 1: // Team Free
            callType = 'Puzzle Request';
            message = started ? originator + ' is requesting a new puzzle.' : originator + "'s puzzle request was completed.";
            icon = <FaGift size="32px" color={!started ? 'purple' : 'red'} className="mr-3" />;
            break;
        case 2:
            callType = 'Help Request';
            message = started ? originator + ' needs assistance from Game Control.' : originator + ' closed an assistance request.';
            icon = <FaQuestionCircle color={!started ? '#663300' : 'orange'} size="32px" className="mr-3" />;
            break;
    }
    return { callType, icon, message };
};

const CallStartedFeedItem = ({ feedItem }: FeedItemProps) => {
    const call = parseCall(feedItem, true);
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div>
                        {call.icon}
                        {call.message}
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>{call.callType}</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const CallEndedFeedItem = ({ feedItem }: FeedItemProps) => {
    const call = parseCall(feedItem, false);
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div>
                        {call.icon}
                        {call.message}
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>{call.callType}</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const SubmissionFeedItem = ({ feedItem }: FeedItemProps) => {
    const submissionColor = () => {
        if (feedItem.numericValue === 2) {
            return 'orange';
        } else if (feedItem.numericValue === 1) {
            return 'green';
        } else {
            return 'red';
        }
    };

    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div style={{ color: submissionColor() }}>{feedItem.description}</div>
                    <div>
                        <small>Submitted by {feedItem.teamName}</small>
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>Submission</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const SkipFeedItem = ({ feedItem }: FeedItemProps) => {
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div style={{ verticalAlign: 'center' }}>
                        {feedItem.teamName} has been skipped over <strong>{feedItem.description}</strong>
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>Skip</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const GcMessageFeedItem = ({ feedItem }: FeedItemProps) => {
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div>{feedItem.description}</div>
                    <div>
                        <small>Sent to {feedItem.teamName}</small>
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>GC Message</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const GcUnlockFeedItem = ({ feedItem }: FeedItemProps) => {
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div style={{ verticalAlign: 'center' }}>
                        <strong>{feedItem.description}</strong> has been unlocked for {feedItem.teamName}
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>GC Unlock</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const TeamUnlockFeedItem = ({ feedItem }: FeedItemProps) => {
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div style={{ verticalAlign: 'center' }}>
                        <strong>{`${feedItem.teamName} has unlocked ${feedItem.description}`}</strong>
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>Team Unlock</small>
                    </div>
                    <div>
                        <small>{moment.utc(feedItem.lastUpdated).fromNow()}</small>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const FeedContent = ({ feedModule }: { feedModule: Module<AggregatedContent[]> }) => {
    if (feedModule.isLoading && feedModule.data.length === 0) {
        return <div>Loading...</div>;
    } else if (feedModule.data.length > 0) {
        return (
            <ListGroup>
                {feedModule.data.map((feedItem: AggregatedContent) => (
                    <ListGroupItem key={`${feedItem.id}-${feedItem.aggregatedContentType.trim()}-${feedItem.lastUpdated}`}>
                        <AbstractFeedItem feedItem={feedItem} />
                    </ListGroupItem>
                ))}
            </ListGroup>
        );
    } else {
        return <div>No items to show</div>;
    }
};

export const StaffFeed = () => {
    document.title = 'Game Control - Activity Feed';

    const feedModule = useSelector(getFeedModule);
    const dispatch = useDispatch();

    useInterval(
        () => {
            dispatch(getStaffFeed());
        },
        // If we have never fetched, include a slight delay to account for the time to run the action.
        !feedModule.lastFetched && !feedModule.isLoading ? 50 : 15000
    );

    return (
        <div>
            <h4>Activity Feed</h4>
            <FeedContent feedModule={feedModule} />
        </div>
    );
};
