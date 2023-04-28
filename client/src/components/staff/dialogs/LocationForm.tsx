import React, { useState } from 'react';
import { Button,  Form,  FormGroup } from 'react-bootstrap'

import { Content } from 'modules/types';
import { LocationTemplate } from 'modules/staff/clues';

type Props = Readonly<{
    location?: Content;
    onSubmit: (locationTemplate: LocationTemplate) => void;
}>;

export const LocationForm = ({ location, onSubmit }: Props) => {
    const [locationId] = useState(location?.contentId ?? undefined);
    const [name, setName] = useState(location?.name ?? '');
    const [address, setAddress] = useState(location?.address ?? '');
    const [latitude, setLatitude] = useState(location?.latitude?.toString() ?? '');
    const [longitude, setLongitude] = useState(location?.longitude?.toString() ?? '');
    const [locationFlags] = useState(location?.locationFlags ?? 0);

    const isLatitudeInvalid = () => isNaN(parseFloat(latitude));
    const isLongitudeInvalid = () => isNaN(parseFloat(longitude));

    return (
        <>
            <FormGroup>
                <Form.Label>Location Name</Form.Label>
                <Form.Control type="text"
                    value={name}
                    onChange={event => setName(event.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Address</Form.Label>
                <Form.Control type="text"
                    value={address}
                    onChange={event => setAddress(event.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Latitude</Form.Label>
                <Form.Control type="text"
                        value={latitude}
                        isInvalid={isLatitudeInvalid()}
                        onChange={(event) => setLatitude(event.target.value)}
                />
                <Form.Control.Feedback type="invalid">Latitude must be a number</Form.Control.Feedback>
            </FormGroup>
            <FormGroup>
                <Form.Label>Longitude</Form.Label>
                <Form.Control type="text"
                    value={longitude}
                    isInvalid={isLongitudeInvalid()}
                    onChange={(event) => setLongitude(event.target.value)}
                />
                <Form.Control.Feedback type="invalid">Longitude must be a number</Form.Control.Feedback>
            </FormGroup>
            <Button
                disabled={isLatitudeInvalid() || isLongitudeInvalid()}
                onClick={() => onSubmit({locationId, name, address, latitude: parseFloat(latitude), longitude: parseFloat(longitude), locationFlags})}>
                { location ? 'Update' : 'Add' }
            </Button>
        </>
    );
}