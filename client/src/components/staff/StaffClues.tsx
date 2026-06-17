import { Breadcrumb, Card } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';

import DialogRenderProp from './dialogs/DialogRenderProp';
import { ClueForm } from './dialogs';
import { PuzzlesList } from './presentation/PuzzlesList';
import { useCreateClueMutation, useStaffCluesQuery } from 'modules/staff/clues/queries';

export const StaffClues = () => {
    document.title = 'Game Control - Puzzles';
    const { data: clues = [], isLoading } = useStaffCluesQuery();
    const createClue = useCreateClueMutation();

    return (
        <div>
            <Breadcrumb>
                <Breadcrumb.Item>Puzzles</Breadcrumb.Item>
            </Breadcrumb>
            <Card>
                <Card.Header>
                    <h4>All Clues</h4>
                    <DialogRenderProp
                        variant="outline-primary"
                        renderTitle={() => 'Add New Puzzle'}
                        renderButton={() => (
                            <>
                                <FaPlus /> Add
                            </>
                        )}
                        renderBody={(onComplete: any) => (
                            <ClueForm onSubmit={(template) => createClue.mutate(template)} onComplete={onComplete} />
                        )}
                    />
                </Card.Header>
            </Card>
            <PuzzlesList clues={clues} isLoading={isLoading} />
        </div>
    );
};
