import React from 'react';
import { Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { FaTrashAlt, FaTrophy } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';

import { Achievement } from 'modules/types';

type Props = Readonly<{
    unlockedAchievement: Achievement;
    deleteUnlock: (achievementId: string) => void;
}>;

export const UnlockedAchievement = ({ deleteUnlock, unlockedAchievement }: Props) => {
    return (
        <Container fluid>
            <Row className='show-grid'>
                <Col xs={8} md={8}>
                    {unlockedAchievement.name}
                </Col>
                <Col xs={4} md={4} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <ButtonGroup>
                        <LinkContainer to={`/staff/achievements`}>                                   
                            <Button size="lg" active><FaTrophy/> Info</Button>
                        </LinkContainer>
                        <Button size="lg"
                            variant="danger"
                            onClick={() => deleteUnlock(unlockedAchievement.achievementId)}>
                            <FaTrashAlt /> Delete
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </Container>
    );
};
