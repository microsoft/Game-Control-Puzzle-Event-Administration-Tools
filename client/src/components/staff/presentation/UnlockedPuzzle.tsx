import React from 'react';
import { Button, ButtonGroup, Col, Container, Row} from 'react-bootstrap';
import { FaPuzzlePiece, FaTrashAlt } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';

import { UnlockedClue } from "modules/staff/clues";

type Props = Readonly<{
    unlockedPuzzle: UnlockedClue
    deleteUnlock: () => void;
}>;

export const UnlockedPuzzle = ({ unlockedPuzzle, deleteUnlock }: Props) => {
    return (
        <Container fluid>
            <Row className='show-grid'>
                <Col xs={8} md={8}>
                    {unlockedPuzzle.title}
                </Col>
                <Col xs={4} md={4}  style={{ display: "flex", justifyContent: "flex-end" }}>
                    <ButtonGroup>
                        <LinkContainer to={`/staff/clues/${unlockedPuzzle.tableOfContentId}`}>
                            <Button size="lg" variant="primary" active><FaPuzzlePiece /> Info</Button>
                        </LinkContainer>
                        <Button size="lg" variant="danger" onClick={deleteUnlock}>
                            <FaTrashAlt /> Delete
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </Container>
    );
};
