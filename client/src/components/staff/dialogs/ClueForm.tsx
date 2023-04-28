import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Datetime from 'react-datetime';
import * as moment from 'moment';

import { StaffClue, StaffClueTemplate } from 'modules/staff/clues';

type Props = Readonly<{
    clue?: StaffClue;
    onSubmit: (clueTemplate: StaffClueTemplate) => void;
    onComplete: () => void;
}>;

export const ClueForm = ({ clue, onSubmit, onComplete }: Props) => {
    const [tableOfContentId] = useState(clue?.tableOfContentId);
    const [title, setTitle] = useState(clue?.submittableTitle ?? '');
    const [shortTitle, setShortTitle] = useState(clue?.shortTitle ?? '');
    const [submittableType, setSubmittableType] = useState(clue?.submittableType?.trim() ?? 'Puzzle');
    const [sortOrder, setSortOrder ] = useState(clue?.sortOrder?.toString() ?? '0');
    const [parTime, setParTime] = useState(clue?.parSolveTime?.toString() ?? "0");
    const [openTime, setOpenTime] = useState<moment.Moment | undefined>(clue?.openTime);
    const [closingTime, setClosingTime] =  useState<moment.Moment | undefined>(clue?.closingTime);

    const isTitleValid = () => title.length > 0;
    const isSortOrderValid = () => !isNaN(parseInt(sortOrder));
    const isParTimeValid = () => !parTime || !isNaN(parseInt(parTime));

    return (
        <>
            <Form.Group>
                <Form.Label>Clue Title</Form.Label>
                <Form.Control
                    type="text"
                    value={title}
                    placeholder="Clue Title"
                    isInvalid={!isTitleValid()}
                    onChange={event => setTitle(event.target.value)}
                />
                <Form.Control.Feedback type="invalid">Title cannot be null</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>Short Name</Form.Label>
                <Form.Control
                    type="text"
                    value={shortTitle}
                    placeholder="Short Title"
                    onChange={event => setShortTitle(event.target.value)}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Clue Type</Form.Label>
                <Form.Control as="select" 
                        onChange={event => setSubmittableType(event.target.value)}
                        value={submittableType}>
                    <option value="Puzzle">Puzzle</option>
                    <option value="LocUnlock">Location</option>
                    <option value="Plot">Plot</option>
                </Form.Control>
            </Form.Group>
            <Form.Group controlId="sortOrderField">
                <Form.Label>Sort Order</Form.Label>
                <Form.Control type="text"
                            isInvalid={!isSortOrderValid()}
                            value={sortOrder}
                            placeholder="Sort Order"
                            onChange={event => setSortOrder(event.target.value)}/>
                <Form.Control.Feedback type="invalid">Sort order must be an integer</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>Open Time</Form.Label>
                <Datetime
                    value={openTime ? moment.utc(openTime).local() : undefined}
                    onChange={value => {
                        if (moment.isMoment(value)) {
                            setOpenTime(moment.utc(value));
                        } else {
                            setOpenTime(undefined);
                        }
                    }}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Closing Time</Form.Label>
                <Datetime
                    value={closingTime ? moment.utc(closingTime).local() : undefined}
                    onChange={value => {
                        if (moment.isMoment(value)) {
                            setClosingTime(moment.utc(value));
                        } else {
                            setClosingTime(undefined);
                        }
                    }}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Par Time</Form.Label>
                <Form.Control
                    type="text"
                    isInvalid={!isParTimeValid()}
                    value={parTime}
                    placeholder="Par Time"
                    onChange={event => setParTime(event.target.value)}/>
                <Form.Control.Feedback type="invalid">Par Time must be an integer</Form.Control.Feedback>
            </Form.Group>
            <Button
                disabled={!isSortOrderValid()}
                onClick={() => {
                    onSubmit({
                        tableOfContentId,
                        title,
                        shortTitle,
                        sortOrder: parseInt(sortOrder),
                        submittableType,
                        parTime: parseInt(parTime),
                    });
                    onComplete();
                }}
            >{ clue ? 'Update' : 'Add' }</Button>
        </>
    );
};