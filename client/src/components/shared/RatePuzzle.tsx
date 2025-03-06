import { useState } from 'react';
import { Button, Form, FormGroup, ToggleButton, ToggleButtonGroup, Card } from 'react-bootstrap';

type Props = Readonly<{
    isBusy: boolean;
    onSubmit: (rating: { rating: number; comment: string }) => void;
}>;

const RatePuzzle = ({ isBusy, onSubmit }: Props) => {
    const [ratingValue, setRatingValue] = useState(3);
    const [ratingText, setRatingText] = useState('');

    return (
        <Card className="playerPuzzleRatingCard">
            <Card.Header>Rate this puzzle</Card.Header>
            <Card.Body>
                <ToggleButtonGroup type="radio" name="ratings" defaultValue={3} value={ratingValue} onChange={(event) => setRatingValue(event.target.value)}>
                    <ToggleButton value={1} disabled={isBusy}>
                        :@
                    </ToggleButton>
                    <ToggleButton value={2} disabled={isBusy}>
                        :(
                    </ToggleButton>
                    <ToggleButton value={3} disabled={isBusy}>
                        :|
                    </ToggleButton>
                    <ToggleButton value={4} disabled={isBusy}>
                        :)
                    </ToggleButton>
                    <ToggleButton value={5} disabled={isBusy}>
                        :D
                    </ToggleButton>
                </ToggleButtonGroup>
                <FormGroup>
                    <Form.Label>Do you have anything else to say about this puzzle?</Form.Label>
                    <Form.Control type="text" value={ratingText} disabled={isBusy} onChange={(event) => setRatingText(event.target.value)} />
                </FormGroup>
                <Button onClick={() => onSubmit({ rating: ratingValue, comment: ratingText })} disabled={isBusy}>
                    Submit
                </Button>
            </Card.Body>
        </Card>
    );
};

export default RatePuzzle;
