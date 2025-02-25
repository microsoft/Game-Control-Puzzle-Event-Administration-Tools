import { useEffect, useState } from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';

type Props = Readonly<{
    label: string;
    groupLabel?: string;
    submitText: string;
    collection: any[];
    getItemKey: (item: any) => string;
    getItemValue: (item: any) => string;
    getItemLabel: (item: any) => string;
    applyCollection: any[];
    onSubmit: (itemValue: any, applyCollectionValues: string[]) => void;
}>;

const SimpleListForm = ({ label, submitText, collection, getItemKey, getItemValue, getItemLabel, applyCollection, onSubmit }: Props) => {
    const [selectedItem, setSelectedItem] = useState(collection[0]);
    const [selectedApplyCollection, setSelectedApplyCollection] = useState(applyCollection.map((atc) => atc.value));
    const [linesShown, setLinesShown] = useState(7);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);

        return () => window.removeEventListener('resize', updateWindowDimensions);
    }, []);

    const updateWindowDimensions = () => {
        if (window.innerHeight < 450) {
            setLinesShown(6);
        } else {
            let linesToShow = 7 + Math.floor((window.innerHeight - 450) / 35);
            let linesCapped = Math.min(linesToShow, applyCollection.length);
            setLinesShown(linesCapped);
        }
    };

    const mapHtmlCollection = (collection: any[], propertyName: string) => {
        let result = [];
        for (var i = 0; i < collection.length; i++) {
            result.push(collection[i][propertyName]);
        }
        return result;
    };

    const renderSelection = () => {
        if (applyCollection.length > 1) {
            let applyList = [];
            for (var i = 0; i < applyCollection.length; i++) {
                applyList.push(applyCollection[i]);
            }
            applyList.sort((act1, act2) => {
                return act1.name.localeCompare(act2.name);
            });
            return (
                <FormGroup>
                    <Form.Label>Apply to {selectedApplyCollection.length}</Form.Label>
                    <Form.Control
                        //validationState={this.validateTeamSelection()}
                        as="select"
                        // onChange={(event) => setSelectedApplyCollection(mapHtmlCollection(event.target.selectedOptions, 'value'))}
                        multiple={true}
                        size={'sm'}
                    >
                        {applyList.map((act) => (
                            <option key={act.key} value={act.value} selected={true}>
                                {act.name}
                            </option>
                        ))}
                    </Form.Control>
                </FormGroup>
            );
        } else if (applyCollection.length === 1) {
            return (
                <FormGroup>
                    <Form.Label>Applying change to {applyCollection[0].value}</Form.Label>
                </FormGroup>
            );
        } else {
            return;
        }
    };

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
                {renderSelection()}
            </FormGroup>
            <Button onClick={() => onSubmit(selectedItem, selectedApplyCollection)}>{submitText}</Button>
        </>
    );
};

export default SimpleListForm;
