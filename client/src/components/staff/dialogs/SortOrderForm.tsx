import { useState } from "react";
import { Button, Form } from "react-bootstrap";

type Props = Readonly<{
    defaultSortOrder: number;
    currentOverride?: number;
    onSubmit: (override: number) => void;
}>;

export const SortOrderForm = ({defaultSortOrder, currentOverride, onSubmit }: Props) => {
    const [newOverride, setNewOverride] = useState( currentOverride?.toString() ?? defaultSortOrder.toString());

    const isInvalid = () => isNaN(parseInt(newOverride));

    return (
        <>
            <Form.Group>
                <Form.Label>New Sort Order</Form.Label>
                <Form.Control type="string"
                              required
                              value={newOverride}
                              isInvalid={isInvalid()}
                              onChange={event => setNewOverride(event.target.value)}
                />
                <Form.Control.Feedback type="invalid">Override must be an integer number</Form.Control.Feedback>
            </Form.Group>
            <div>
                <Button 
                    disabled={isInvalid()}
                    onClick={() => onSubmit(parseInt(newOverride))}>
                    Update
                </Button>
            </div>
        </>
    );
};