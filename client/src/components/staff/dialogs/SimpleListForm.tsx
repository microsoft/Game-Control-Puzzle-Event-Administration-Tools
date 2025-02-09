import { useState } from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';

type Props = Readonly<{
    label: string;
    submitText: string;
    collection: any[];
    getItemKey: (item: any) => string;
    getItemValue: (item: any) => string;
    getItemLabel: (item: any) => string;
    onSubmit: (selectedItem: string) => void;
}>;

const SimpleListForm = ({ collection, label, getItemKey, getItemLabel, getItemValue, onSubmit, submitText }: Props) => {
    const [selectedItem, setSelectedItem] = useState(getItemKey(collection[0]));

    return (
        <>
            <FormGroup>
                <Form.Label>{label}</Form.Label>
                <Form.Control as="select" value={selectedItem} onChange={(event) => setSelectedItem(event.target.value)}>
                    {collection.map((collectionItem) => (
                        <option key={getItemKey(collectionItem)} value={getItemValue(collectionItem)}>
                            {getItemLabel(collectionItem)}
                        </option>
                    ))}
                </Form.Control>
            </FormGroup>
            <Button onClick={() => onSubmit(selectedItem)}>{submitText}</Button>
        </>
    );
};

export default SimpleListForm;
