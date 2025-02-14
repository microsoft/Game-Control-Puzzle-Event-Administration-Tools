import { PlayerChallengeTemplate } from 'modules/player';
import { useState } from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';
import ImageUploader from 'react-images-upload';

type Props = Readonly<{
    onSubmit: (submission: PlayerChallengeTemplate) => void;
}>;

const ChallengeSubmissionFragment = ({ onSubmit }: Props) => {
    const [submissionType, setSubmissionType] = useState<string>('ChallengePic');
    const [submissionNotes, setSubmissionNotes] = useState('');
    const [submissionImage, setSubmissionImage] = useState<File | null>(null);
    const [submissionTextContent, setSubmissionTextContent] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);

    return (
        <>
            <div className="mb-4">Helpful hint: to submit a video, upload to OneDrive or another sharing site, and then share the hyperlink here.</div>
            <FormGroup>
                <Form.Label>Response Type</Form.Label>
                <Form.Control as="select" value={submissionType} onChange={(event) => setSubmissionType(event.target.value)}>
                    <option value="ChallengePic">Photo</option>
                    <option value="PlainText">Text or Hyperlink</option>
                </Form.Control>
            </FormGroup>
            {submissionType === 'ChallengePic' && (
                <FormGroup>
                    <Form.Label>Photo</Form.Label>
                    <ImageUploader
                        withIcon={true}
                        buttonText="Choose image"
                        label="Max file size: 20MB.  Accepted file types:  JPG, GIF, PNG"
                        singleImage={true}
                        withPreview={true}
                        onChange={(pictureFiles, pictureDataURLs) => {
                            setSubmissionImage(pictureFiles[0]);
                        }}
                        imgExtension={['.jpg', '.gif', '.png', '.jpeg']}
                        maxFileSize={20971520}
                    />
                </FormGroup>
            )}
            {submissionType === 'PlainText' && (
                <FormGroup>
                    <Form.Label>Text or Hyperlink</Form.Label>
                    <Form.Control as="textarea" value={submissionTextContent} rows={5} onChange={(event) => setSubmissionTextContent(event.target.value)} />
                </FormGroup>
            )}
            <FormGroup>
                <Form.Label>Optional Extra Notes</Form.Label>
                <Form.Control as="textarea" value={submissionNotes} rows={4} onChange={(event) => setSubmissionNotes(event.target.value)} />
            </FormGroup>
            <div>
                Uploading large files can take a little while, so please click the button once and be patient - thanks! Uploads may take up to 30 seconds during times of heavy
                load.
            </div>
            <Button
                disabled={isDisabled}
                onClick={() => {
                    setIsDisabled(true);
                    onSubmit({
                        submissionType,
                        submissionNotes,
                        submissionImage: submissionType === 'ChallengePic' ? submissionImage : null,
                        submissionTextContent: submissionType !== 'ChallengePic' ? submissionTextContent : '',
                        isDisabled,
                    });
                }}
            >
                Submit
            </Button>
        </>
    );
};

export default ChallengeSubmissionFragment;
