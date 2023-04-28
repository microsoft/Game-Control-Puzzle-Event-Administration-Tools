import React from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';
import ImageUploader from 'react-images-upload';

export default class ChallengeSubmissionFragment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            submissionType: 'ChallengePic',
            submissionNotes: '',
            submissionImage: null,
            submissionTextContent: '',
            isDisabled: false
        };
    }

    render() {
        return (
            <>
                <div className="mb-4">Helpful hint: to submit a video, upload to OneDrive or another sharing site, and then share the hyperlink here.</div>
                <FormGroup>
                    <Form.Label>Response Type</Form.Label>
                    <Form.Control as="select"
                        value={this.state.submissionType}
                        onChange={event => this.setState({ submissionType: event.target.value })}>
                        <option value="ChallengePic">Photo</option>
                        <option value="PlainText">Text or Hyperlink</option>
                    </Form.Control>
                </FormGroup>
                {this.state.submissionType === "ChallengePic" && (
                    <FormGroup>
                        <Form.Label>Photo</Form.Label>
                        <ImageUploader
                            ref={this.uploader}
                            withIcon={true}
                            buttonText='Choose image'
                            label='Max file size: 20MB.  Accepted file types:  JPG, GIF, PNG'
                            singleImage={true}
                            withPreview={true}
                            onChange={(pictureFiles, pictureDataURLs) => {
                                this.setState({
                                    submissionImage: pictureFiles[0]
                                })
                            }}
                            imgExtension={['.jpg', '.gif', '.png', '.jpeg']}
                            maxFileSize={20971520}
                        />
                    </FormGroup>)}
                {this.state.submissionType === "PlainText" &&
                    (
                        <FormGroup>
                            <Form.Label>Text or Hyperlink</Form.Label>
                            <Form.Control as="textarea"
                                disabled={this.state.submissionType === "ChallengePic"}
                                value={this.state.submissionTextContent}
                                rows={5}
                                onChange={event => this.setState({ submissionTextContent: event.target.value })} />
                        </FormGroup>)
                }
                <FormGroup>
                    <Form.Label>Optional Extra Notes</Form.Label>
                    <Form.Control as="textarea"
                        value={this.state.submissionNotes}
                        rows={4}
                        onChange={event => this.setState({ submissionNotes: event.target.value })} />
                </FormGroup>
                <div>Uploading large files can take a little while, so please click the button once and be patient - thanks! Uploads may take up to 30 seconds during times of heavy load.</div>
                <Button disabled={this.state.isDisabled} onClick={() => {this.setState({isDisabled: true}); this.props.onSubmit(
                    {
                        ...this.state,
                        submissionImage: this.state.submissionType === "ChallengePic" ? this.state.submissionImage : null,
                        submissionTextContent: this.state.submissionType !== "ChallengePic" ? this.state.submissionTextContent : null
                    })}}>
                    Submit
                </Button>
            </>
        );
    }
}