import { useRef, useState } from 'react';
import { Button, Form,  FormGroup, ToggleButton, ToggleButtonGroup, Card } from 'react-bootstrap';
import ImageUploader from 'react-images-upload';

import { PulseTemplate } from "modules/player";

type Props = Readonly<{
    isBusy: boolean;
    onSubmit: (pulseTemplate: PulseTemplate) => void;
}>;

export const PulseControl = ({ isBusy, onSubmit }: Props) => {
    const [pulseTemplate, setPulseTemplate] = useState<PulseTemplate>({
        pulseText: "",
        pulseRating: 3,
        pulseImage: null
    });
    const uploader = useRef<any>();
    
    const onDrop = (pictureFiles: File[], pictureDataURLs: string[]) => {
        setPulseTemplate({
            ...pulseTemplate,
            pulseImage: pictureFiles[0]
        });
    }

    const submitPulse = () => {        
        onSubmit(pulseTemplate);

        setPulseTemplate({
            pulseText: "",
            pulseRating: 3,
            pulseImage: null    
        });

        uploader.current?.clearPictures();
    }
    
    const isEnabled = pulseTemplate.pulseText.length > 0 && pulseTemplate.pulseText.length;

    return (
        <Card className="playerPulseForm">
            <Card.Header>Send a Pulse</Card.Header>
                    <FormGroup>
                        <Form.Label>How are you feeling?</Form.Label>
                        <Form.Control type="text"
                                        value={pulseTemplate.pulseText}
                                        disabled={isBusy}
                                        as="textarea"
                                        maxLength={254}
                                        rows={5}
                                        onChange={event => 
                                            setPulseTemplate({
                                                ...pulseTemplate,
                                                pulseText: event.target.value
                                            })
                                        }
                        />
                    </FormGroup>

                    <FormGroup>
                        <ToggleButtonGroup 
                                type="radio" 
                                name="pulseRating" 
                                defaultValue={3}
                                value={ pulseTemplate.pulseRating }
                                onChange={value => 
                                    setPulseTemplate({
                                        ...pulseTemplate,
                                        pulseRating: value
                                    })}
                        >
                            <ToggleButton variant="outline-dark" value={1} disabled={ isBusy }><span role="img" aria-label="I hated it">&#x1F621;</span></ToggleButton>
                            <ToggleButton variant="outline-dark" value={2} disabled={ isBusy }><span role="img" aria-label="I didn't like it">&#x1F61E;</span></ToggleButton>
                            <ToggleButton variant="outline-dark" value={3} disabled={ isBusy }><span role="img" aria-label="I have mixed feelings">&#x1F612;</span></ToggleButton>
                            <ToggleButton variant="outline-dark" value={4} disabled={ isBusy }><span role="img" aria-label="I liked it">&#x1F60A;</span></ToggleButton>
                            <ToggleButton variant="outline-dark" value={5} disabled={ isBusy }><span role="img" aria-label="I loved it">&#x1F60D;</span></ToggleButton>
                        </ToggleButtonGroup>
                    </FormGroup>

                    <Card><Card.Header>Add A Photo</Card.Header>

                    <ImageUploader
                        ref={uploader}
                        withIcon={true}
                        buttonText='Choose image'
                        singleImage={true}
                        withPreview={true}
                        onChange={onDrop}
                        imgExtension={['.jpg', '.gif', '.png']}
                        maxFileSize={52428800}
                    />
                                    </Card>
                    

                    <Button type="submit" disabled={ isBusy || !isEnabled } onClick={submitPulse}>Submit</Button>
        </Card>
    );
}