import React from 'react';
import { Button, Form,  FormGroup } from 'react-bootstrap';

export default class SimpleListForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedItem: this.props.getItemKey(props.collection[0])
        }
    }
    render() {
        return (
            <React.Fragment>
                <FormGroup>
                    <Form.Label>{this.props.label}</Form.Label>
                    <Form.Control as="select"
s                                value={this.state.selectedItem}
                                onChange={event => this.setState({selectedItem: event.target.value})}>
                        {this.props.collection.map(collectionItem =>
                            <option key={this.props.getItemKey(collectionItem)}
                                    value={this.props.getItemValue(collectionItem)}>
                                {this.props.getItemLabel(collectionItem)}
                            </option>
                        )}
                    </Form.Control>
                </FormGroup>
                <Button onClick={() => this.props.onSubmit(this.state.selectedItem)}>
                    {this.props.submitText}
                </Button>
            </React.Fragment>
        );
    }
}