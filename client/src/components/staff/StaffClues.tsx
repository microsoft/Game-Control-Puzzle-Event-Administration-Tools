import { Breadcrumb, Card } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';

import DialogRenderProp from './dialogs/DialogRenderProp';
import { ClueForm } from './dialogs';
import { PuzzlesList } from './presentation/PuzzlesList';
import { useStaffClues } from 'modules/staff/clues';

export const StaffClues = () => {
    document.title = "Game Control - Puzzles";
    const { cluesModule, addClue } = useStaffClues();

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
                        renderTitle={() => "Add New Puzzle"}
                        renderButton={() => <><FaPlus/> Add</>}
                        renderBody={(onComplete: any) =>
                            <ClueForm
                                onSubmit={addClue}
                                onComplete={onComplete}
                            />
                        }
                    />
                </Card.Header>
            </Card>
            <PuzzlesList clues={cluesModule} />
        </div>
    );
};
