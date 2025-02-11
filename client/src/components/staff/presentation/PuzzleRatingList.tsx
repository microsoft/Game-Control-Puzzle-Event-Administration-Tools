import React from 'react';
import * as moment from 'moment';
import { Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { ClueRating } from 'modules/staff/clues';

type Props = Readonly<{
    ratings: ClueRating[];
}>;

const PuzzleRatingList = ({ ratings }: Props) => {
    return (
        <ListGroup>
            {ratings.map((rating) => (
                <ListGroupItem key={rating.participationId}>
                    <div>
                        <Row>
                            <Col xs={10} md={8} style={{ textAlign: 'left' }}>
                                <div>
                                    <strong>
                                        {rating.rating} {rating.comments.length > 0 ? `- ${rating.comments}` : ''}
                                    </strong>
                                </div>
                                <div>
                                    <small>
                                        Submitted by {rating.ratedByUser} ({rating.ratedByTeam})
                                    </small>
                                </div>
                            </Col>
                            <Col xs={2} md={2} style={{ textAlign: 'right' }}>
                                <div>
                                    <small>{moment.utc(rating.lastUpdated).fromNow()}</small>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default PuzzleRatingList;
