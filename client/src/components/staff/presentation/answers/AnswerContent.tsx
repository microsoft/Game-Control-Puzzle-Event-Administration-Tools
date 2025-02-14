import { Button, Col, Container, Row } from 'react-bootstrap';
import { FaTrashAlt } from 'react-icons/fa';

import { Content } from 'modules/types';
import { AdditionalContent } from '../AdditionalContent';

type Props = Readonly<{
    content: Content;
    deleteContent: () => void;
}>;

export const AnswerContent = ({ content, deleteContent }: Props) => {
    if (content) {
        return (
            <Container fluid>
                <Row>
                    <Col>
                        <AdditionalContent content={content} />
                    </Col>
                    <Col style={{ justifyContent: 'flex-end', display: 'flex' }}>
                        <Button size="lg" onClick={deleteContent} variant="danger">
                            <FaTrashAlt /> Delete
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
    } else {
        return <div style={{ textAlign: 'center' }}>There is no additional content for this answer.</div>;
    }
};
