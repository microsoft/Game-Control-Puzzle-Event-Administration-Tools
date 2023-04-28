import React from 'react';
import { ListGroup, ListGroupItem, Row, Col, Button } from 'react-bootstrap';
import { FaPencilAlt, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import DialogRenderProp from '../dialogs/DialogRenderProp';
import { PuzzleInstanceForm } from "../dialogs/PuzzleInstanceForm";
import { getStaffTeams } from 'modules/staff';
import { ClueInstance, ClueInstanceTemplate } from 'modules/staff/clues';
import { deleteClueInstance, updateClueInstance } from 'modules/staff/clues/service';

type InstanceProps = Readonly<{
    instance: ClueInstance;
    onEditInstance: (tableOfContentId: string, template: ClueInstanceTemplate) => void;
    onDeleteInstance: (tableOfContentId: string, instanceId: string) => void;
}>;

const PuzzleInstance = ({ instance, onEditInstance, onDeleteInstance }: InstanceProps) => {
    const allTeams = useSelector(getStaffTeams).data;
    const currentTeam = allTeams && allTeams.find(x => x.teamId === instance.currentTeam);

    let formatting = "instance-available";
    if (instance.needsReset) {formatting = "instance-needsreset";}
    if (currentTeam) {formatting = "instance-active";}

    return (
        <ListGroupItem>
            <div className={formatting}>
                <Row>
                <Col xs={8} md={8} style={{textAlign: "center", verticalAlign: "center"}}>
                        <div>
                            <div>{instance.friendlyName}</div>
                            { !!instance.notes && <div>Staff Notes: {instance.notes}</div> }
                            { !!currentTeam && <div>Currently in use by {currentTeam.name}</div> }
                            { !!instance.needsReset && <div>Offline or needs reset</div> }
                        </div>
                    </Col>
                    <Col xs={4} md={4} style={{textAlign: "right"}}>
                        <DialogRenderProp
                            renderTitle={() => "Update puzzle instance"}
                            renderButton={() => <><Button variant="outline-info"><FaPencilAlt />Edit</Button></>}
                            renderBody={(onComplete: any) =>
                                <PuzzleInstanceForm
                                    currentInstance={instance}
                                    allTeams={allTeams}
                                    onUpdate={instanceTemplate => {
                                        onEditInstance(instance.tableOfContentId, instanceTemplate);
                                        onComplete();
                                    }}
                                />
                            }
                        />
                        &nbsp;
                        <Button onClick={() => onDeleteInstance(instance.tableOfContentId, instance.id)}><FaTrashAlt/> Delete</Button>
                        {instance.needsReset && <Button onClick={() => onEditInstance(instance.tableOfContentId, {...instance, needsReset: false})}>Reset</Button>}
                    </Col>
                </Row>
            </div>
        </ListGroupItem>
    );
}

type InstanceListProps = Readonly<{
    instances: ClueInstance[];
    onEditInstance: (tableOfContentId: string, template: ClueInstanceTemplate) => void;
    onDeleteInstance: (tableOfContentId: string, instanceId: string) => void;
}>;

const PuzzleInstanceList = ({ instances, onEditInstance, onDeleteInstance }: InstanceListProps) => {
    return (
        <div>
            <h3>This puzzle has {instances.length} instances</h3>
            <ListGroup>
                {instances.map(p => <PuzzleInstance key={p.id} instance={p} onEditInstance={onEditInstance} onDeleteInstance={onDeleteInstance} />)}
            </ListGroup>
        </div>
    );
}

type Props = Readonly<{
    tableOfContentId: string;
    instances: ClueInstance[];
}>;

export const PuzzleInstances = ({ tableOfContentId, instances }: Props) => {
    const allTeams = useSelector(getStaffTeams);
    const dispatch = useDispatch();
    const updateInstance = (tableOfContentId: string, instance: ClueInstanceTemplate) => dispatch(updateClueInstance(tableOfContentId, instance));
    const deleteInstance = (tableOfContentId: string, instanceId: string) => dispatch(deleteClueInstance(tableOfContentId, instanceId));

    return (
        <div>
            <DialogRenderProp
                variant="outline-primary"
                renderTitle={() => "Add puzzle instance"}
                renderButton={() => <><FaPlus/> Add Instance</>}
                renderBody={(onComplete: any) =>
                    <PuzzleInstanceForm
                        allTeams={allTeams.data}
                        onUpdate={instance => {
                            updateInstance(tableOfContentId, instance);
                            onComplete();
                        }}
                    />
                }
            />

            { !instances ?
                <div>This puzzle has no instances configured</div> :
                <PuzzleInstanceList instances={instances} onEditInstance={updateInstance} onDeleteInstance={deleteInstance}/>
            }
        </div>
    );
};
