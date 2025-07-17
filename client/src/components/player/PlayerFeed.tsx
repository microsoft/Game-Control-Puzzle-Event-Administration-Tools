import React from 'react';
import { Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { FaCoins } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';

import * as constants from '../../constants';
import { getPointsNameSetting } from 'modules';
import { AggregatedContent } from 'modules/types/models';
import { getFeedModule, usePlayerTakeOverClue } from 'modules/player';
import { getPlayerFeed } from 'modules/player/feed/service';
import { useInterval } from 'utils/hooks';
import { Redirect } from 'react-router-dom';

type FeedItemProps = Readonly<{
    feedItem: AggregatedContent;
}>;

const AbstractFeedItem = ({ feedItem }: FeedItemProps) => {
    switch (feedItem.aggregatedContentType.trim()) {
        case 'Pulse':
            return (
                <ListGroupItem key={feedItem.id}>
                    <PulseFeedItem feedItem={feedItem} />
                </ListGroupItem>
            );
        case 'Submission':
            return (
                <ListGroupItem key={feedItem.id}>
                    <SubmissionFeedItem feedItem={feedItem} />
                </ListGroupItem>
            );
        case 'GcUnlock':
        case 'Answer':
            return (
                <ListGroupItem key={feedItem.id}>
                    <TeamUnlockFeedItem feedItem={feedItem} />
                </ListGroupItem>
            );
        case 'GcMessage':
            return (
                <ListGroupItem key={feedItem.id}>
                    <GcMessageFeedItem feedItem={feedItem} />
                </ListGroupItem>
            );
        case 'AchievementUnlock':
            return (
                <ListGroupItem key={feedItem.id}>
                    <AchievementFeedItem feedItem={feedItem} />
                </ListGroupItem>
            );
        case 'PointsAward':
            return (
                <ListGroupItem key={feedItem.id}>
                    <PointsFeedItem feedItem={feedItem} />
                </ListGroupItem>
            );
        default:
            console.warn('Unknown feed type', feedItem);
            return null;
    }
};

export const AchievementFeedItem = ({ feedItem }: FeedItemProps) => {
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

export const PointsFeedItem = ({ feedItem }: FeedItemProps) => {
    const pointsSettingName = useSelector(getPointsNameSetting);

    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div>
                        <FaCoins size="32px" className="mr-3" />
                        <strong>{feedItem.teamName}</strong> earned <strong>{feedItem.numericValue}</strong> {pointsSettingName} for {feedItem.description}
                    </div>
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>{pointsSettingName}</small>
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
                </Col>
                <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                    <div>
                        <small>Message from GC</small>
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
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div>{feedItem.description}</div>
                    <div>
                        <small>Pulsed by {feedItem.teamName}</small>
                    </div>
                    {feedItem.hasAdditionalImage && <img alt="" src={constants.APPLICATION_URL + 'api/content/pulseThumb/' + feedItem.id} />}
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

const SubmissionFeedItem = ({ feedItem }: FeedItemProps) => {
    return (
        <div>
            <Row>
                <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                    <div style={{ color: feedItem.numericValue > 0 ? 'green' : 'red' }}>{feedItem.description}</div>
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

export const PlayerFeed = () => {
    const feedModule = useSelector(getFeedModule);
    const takeOverClue = usePlayerTakeOverClue();
    const dispatch = useDispatch();
    document.title = 'Activity Feed';

    useInterval(
        () => dispatch(getPlayerFeed()),
        // If we have never fetched, include a slight delay to account for the time to run the action.
        !feedModule.lastFetched && !feedModule.isLoading ? 50 : 15000
    );

    if (takeOverClue) {
        return <Redirect to={`/player/clue/${takeOverClue.tableOfContentId}`} />
    }

    return (
        <div>
            <div>Team Activity</div>
            {!!feedModule.lastError && <div>There was an error loading the activity feed</div>}
            {!!feedModule.data && (
                <ListGroup>
                    {feedModule.data.map((feedItem: AggregatedContent) => (
                        <AbstractFeedItem feedItem={feedItem} />
                    ))}
                </ListGroup>
            )}
        </div>
    );
};
