import React from 'react';
import * as moment from 'moment';
import { Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap';

export default class PuzzleRatingList extends React.Component {
    render() {
        return <ListGroup>
            {this.props.ratings.map(rating => 
                <ListGroupItem key={rating.participationId}>
                    <div>
                        <Row>
                            <Col xs={10} md={8} style={{textAlign: "left"}}>
                                <div><strong>{rating.rating} {rating.comments.length > 0 ? `- ${rating.comments}` : ""}</strong></div>
                                <div><small>Submitted by {rating.ratedByUser} ({rating.ratedByTeam})</small></div>
                            </Col>
                            <Col xs={2} md={2} style={{textAlign: "right"}}>                                            
                                <div><small>{moment.utc(rating.lastUpdated).fromNow()}</small></div>
                            </Col>
                        </Row>
                    </div>
                </ListGroupItem>
            )}
        </ListGroup>;
    }
}