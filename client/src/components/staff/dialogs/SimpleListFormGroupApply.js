import React from 'react';
import { Button, Form,  FormGroup } from 'react-bootstrap';

export default class SimpleListForm extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.applyCollection === undefined || this.props.applyCollection === null) {
            this.props.applyCollection = [];
        }

        this.state = {
            selectedItem: this.props.getItemKey(props.collection[0]),
            selectedApplyCollection: this.props.applyCollection.map(atc => atc.value)
        }
    }
    render() {
        return (
            <React.Fragment>
                <FormGroup>
                    <Form.Label>{this.props.label}</Form.Label>
                    <Form.Control as="select"
                                value={this.state.selectedItem}
                                onChange={event => this.setState({selectedItem: event.target.value})}>
                        {this.props.collection.map(collectionItem =>
                            <option key={this.props.getItemKey(collectionItem)}
                                    value={this.props.getItemValue(collectionItem)}>
                                {this.props.getItemLabel(collectionItem)}
                            </option>
                        )}
                    </Form.Control>
                    {this.renderSelection()}
                </FormGroup>
                <Button onClick={() => this.props.onSubmit(this.state.selectedItem, this.state.selectedApplyCollection)}>
                    {this.props.submitText}
                </Button>
            </React.Fragment>
        );
    }
    renderSelection() {
        if (this.props.applyCollection.length > 1) {
            let applyList = [];
            for (var i = 0; i < this.props.applyCollection.length; i++) {
                applyList.push(this.props.applyCollection[i]);
            }
            applyList.sort((act1, act2) => {
                return act1.name.localeCompare(act2.name);
            });
            return (
                <FormGroup>
                    <Form.Label>Apply to {this.state.selectedApplyCollection.length}</Form.Label>
                    <Form.Control
                                    //validationState={this.validateTeamSelection()}
                                    as="select"
                                    onChange={event => this.setState({selectedApplyCollection: this.mapHtmlCollection(event.target.selectedOptions, "value")})}
                                    multiple="true"
                                    size={this.state.linesShown}>
                        {applyList.map(act =>
                            <option 
                                key={act.key}
                                value={act.value}
                                selected={true}>
                                {act.name}
                            </option>
                        )}
                    </Form.Control>
                </FormGroup>
            );
        }
        else if (this.props.applyCollection.length === 1) {
            return (
                <FormGroup>
                    <Form.Label>Applying change to {this.props.applyCollection[0].value}</Form.Label>
                </FormGroup>
            );
        }
        else {
            return;
        }
    }
    mapHtmlCollection(collection, propertyName) {
        let result = [];
        for (var i = 0; i < collection.length; i++) {
            result.push(collection[i][propertyName]);
        }
        return result;
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions.bind(this));
    }

    updateWindowDimensions() {
        if (window.innerHeight < 450) {
            this.setState({ linesShown: 6 });
        }
        else {
            let linesToShow = 7 + Math.floor((window.innerHeight - 450) / 35);
            let linesCapped = Math.min(linesToShow, this.props.applyCollection.length)
            this.setState({ linesShown: linesCapped });
        }
    }
}