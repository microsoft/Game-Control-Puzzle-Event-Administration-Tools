import React from 'react';
import { Button, Form,  FormGroup, ToggleButton, ToggleButtonGroup, Card } from 'react-bootstrap';

export default class RatePuzzle extends React.Component {    
    constructor(props) {
        super(props);

        this.state = {
            ratingValue: 3,
            ratingText: ''
        };

        this.handleSubmitRating     = this.handleSubmitRating.bind(this);
        this.handleRatingChange     = this.handleRatingChange.bind(this);
        this.handleRatingTextChange = this.handleRatingTextChange.bind(this);
    }

    handleSubmitRating(event) {
        event.preventDefault(); 
        this.props.onSubmit({
            rating: this.state.ratingValue,
            comment: this.state.ratingText
        });
    }

    handleRatingChange(value) {
        this.setState({ ratingValue: value });
    }

    handleRatingTextChange(event) {
        this.setState({ ratingText: event.target.value });
    }

    render() {
        return <Card className="playerPuzzleRatingCard" >
            <Card.Header>Rate this puzzle</Card.Header>
            <Card.Body>
            <ToggleButtonGroup 
                    type="radio" 
                    name="ratings" 
                    defaultValue={3}
                    value={ this.state.ratingValue }
                    onChange={ this.handleRatingChange }>
                <ToggleButton value={1} disabled={ this.props.isBusy }>:@</ToggleButton>
                <ToggleButton value={2} disabled={ this.props.isBusy }>:(</ToggleButton>
                <ToggleButton value={3} disabled={ this.props.isBusy }>:|</ToggleButton>
                <ToggleButton value={4} disabled={ this.props.isBusy }>:)</ToggleButton>
                <ToggleButton value={5} disabled={ this.props.isBusy }>:D</ToggleButton>
            </ToggleButtonGroup>
            <FormGroup>
                <Form.Label>Do you have anything else to say about this puzzle?</Form.Label>
                <Form.Control type="text"
                            value={this.state.ratingText}
                            disabled={ this.props.isBusy }
                            onChange={this.handleRatingTextChange}/>
            </FormGroup>
            <Button onClick={ this.handleSubmitRating } disabled={ this.props.isBusy }>Submit</Button>
            </Card.Body>
        </Card>;
    }
}