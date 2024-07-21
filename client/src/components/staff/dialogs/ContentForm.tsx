import React, { useState, useRef, useEffect } from 'react';
import { Button,  Form, FormGroup } from 'react-bootstrap'
import CodeMirror from 'react-codemirror';

import { Achievement, Content } from 'modules/types';
import { ContentTemplate } from 'modules/staff/clues/models';

require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/lib/codemirror.css');

type Props = Readonly<{
    content?: Content;
    achievements?: Array<Achievement>
    onSubmit: (contentTemplate: ContentTemplate) => void;
}>;

export const ContentForm = ({ content, achievements, onSubmit }: Props) => {
    const [contentId] = useState(content?.contentId ?? undefined);
    const [contentName, setContentName] = useState(content?.name ?? '');
    const [contentType, setContentType] = useState(content?.contentType ?? 'PlainText');
    const [stringContent, setStringContent] = useState(content?.stringContent ?? '');
    const [binaryContent, setBinaryContent] = useState(null);
    const [achievementUnlockId, setAchievementUnlockId] = useState(content?.achievementUnlockId ?? undefined);
    
    const codeMirror = useRef<ReactCodeMirror.ReactCodeMirror | null>(null);

    useEffect(()=>{
        codeMirror.current?.getCodeMirror().refresh();
    }, []);

    const isNameValid = () => {
        return contentName.length > 0;
    }

    const isTextContentValid = () => {
        if (contentType === 'YoutubeUrl') {
            return stringContent.includes('embed');
        } else if (contentType !== 'Image') {
            return stringContent.length > 0;
        } else {
            return true;
        }
    }

    return (
        <>
            <FormGroup>
                <Form.Label>Content Name</Form.Label>
                <Form.Control type="text"
                            required
                            value={contentName}
                            isInvalid={!isNameValid()}
                            onChange={(event) => setContentName(event.target.value)}/>
                <Form.Text className="text-muted">Use 'UnsolvedPlot' or 'SolvedPlot' for plot content.</Form.Text>
                <Form.Control.Feedback type="invalid">Name is required</Form.Control.Feedback>
            </FormGroup>
            <FormGroup>
                <Form.Label>Content Type</Form.Label>
                <Form.Control as="select"
                                disabled={!!content}
                                value={contentType}
                                onChange={event => setContentType(event.target.value)}>
                    <option value='PlainText'>Plain Text</option>
                    <option value='RichText'>HTML Content</option>
                    <option value='YoutubeUrl'>YouTube Link</option>
                    <option value='Image'>Image</option>
                    <option value='Hyperlink'>Hyperlink</option>
                </Form.Control>
            </FormGroup>
            {contentType === "Image" && (
            <FormGroup>
                <Form.Label>Image Content</Form.Label>
                <Form.Control
                    type="file"
                    onChange={(event: any) => setBinaryContent(event.target.files[0])}
                />
            </FormGroup>)
            }
            
            {
                contentType === "RichText" &&
                <FormGroup>
                    <Form.Label>HTML Content</Form.Label>
                    <CodeMirror
                        ref={codeMirror}
                        value={stringContent} 
                        onChange={(value) => setStringContent(value)}
                        options={{ lineNumbers: true }}
                    />
                    <h6>To insert a unique id in the URL, use [[player]], [[team]] or [[shortname]] as a replacement token.</h6>
                </FormGroup>
            }
            {
                (contentType !== "Image" && contentType !== "RichText") &&
                <FormGroup>
                    <Form.Label>Text Content</Form.Label>
                    <Form.Control
                        type="text"
                        value={stringContent}
                        isInvalid={!isTextContentValid()}
                        onChange={(event) => setStringContent(event.target.value)}
                    />
                    <h6>To insert a unique id in the URL, use [[player]], [[team]] or [[shortname]] as a replacement token.</h6>
                    <Form.Control.Feedback type="invalid">Content must not be empty, and if a youtube URL must include embed in the URL</Form.Control.Feedback>
                </FormGroup>
            }

            <FormGroup>
                <Form.Label>Unlocked by Achievement</Form.Label>
                <Form.Control as="select"
                                disabled={!!content || !achievements}
                                value={achievementUnlockId}
                                onChange={event => setAchievementUnlockId(event.target.value)}>
                    <option value="" selected>None</option>
                {              
                    achievements?.map((achievement) => <option value={achievement.achievementId}>{achievement.name}</option>)
                }
                </Form.Control>
            </FormGroup>
            
            <Button onClick={() => {
                onSubmit({
                    contentId,
                    contentName,
                    contentType,
                    binaryContent: contentType === 'Image' ? binaryContent : undefined,
                    stringContent: contentName !== 'Image' ? stringContent : undefined
                });
            }}>
                {content ? 'Update' : 'Add'}
            </Button>
        </>
    );
}