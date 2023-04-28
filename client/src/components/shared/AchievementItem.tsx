import React from 'react';
import { Col, Row} from 'react-bootstrap';
import * as moment from 'moment';

import * as constants from '../../constants';
import { Achievement } from 'modules/types';

type Props = Readonly<{
    achievement: Achievement;
    dateText: string;
}>;

export const AchievementItem = ({ achievement, dateText }: Props) => {
    return (
        <div>
            <Row className="show-grid">
                <Col xs={4} md={4} style={{textAlign: "right"}}>
                    <img src={`${constants.APPLICATION_URL}api/content/achievement?achievementId=${achievement.achievementId}`} height='64' width='64' alt="achievement-logo"/>
                </Col>
                <Col xs={8} md={8} style={{textAlign: "left"}}>
                    <div><strong>{achievement.name}</strong></div>
                    <div>{achievement.description}</div>
                    <div><small>&nbsp;</small></div>
                    <div><small>{dateText}: {moment.utc(achievement.lastUpdated).local().format('MMMM Do, h:mm')}</small></div>
                </Col>
            </Row>
        </div>
    );
};