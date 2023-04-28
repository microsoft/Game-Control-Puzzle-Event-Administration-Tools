import React, { useState } from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';

import { AchievementTemplate } from 'modules/staff/achievements';
import { Achievement } from 'modules/types';

type AchievementFormProps = Readonly<{
    achievement?: Achievement;
    onSubmit: (achievement: AchievementTemplate) => any;
    onComplete: () => any;
}>;

export const AchievementForm = ({ achievement, onSubmit, onComplete }: AchievementFormProps) => {
    const [achievementId] = useState(achievement?.achievementId);
    const [name, setName] = useState(achievement?.name ?? '');
    const [description, setDescription] = useState(achievement?.description ?? '');
    const [achievementImage, setAchievementImage] = useState();

    return (
        <>
            <FormGroup>
                <Form.Label>Name</Form.Label>
                <Form.Control type="text"
                              value={name}
                              onChange={(event: any) => setName(event.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Description</Form.Label>
                <Form.Control type="text"
                              value={description}
                              onChange={(event: any) => setDescription(event.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Image</Form.Label>
                <Form.File type="file"
                           onChange={(event: any) => setAchievementImage(event.target.files[0])}
                />
            </FormGroup>
            <Button onClick={() => {
                onSubmit({achievementId, name, description, achievementImage});
                onComplete();
            }}>
                { achievement ? 'Update' : 'Add' }
            </Button>
        </>
    );
}