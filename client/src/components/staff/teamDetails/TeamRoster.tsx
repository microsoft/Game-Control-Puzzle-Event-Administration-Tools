import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';

import DialogRenderProp from '../dialogs/DialogRenderProp';
import { EditParticipantForm } from '../../admin/dialogs/EditParticipantForm';

type Props = Readonly<{
    roster: any[];
    updateUserInfo: (participantId: string, updates: any) => void;
}>;

export const TeamRoster = ({ roster, updateUserInfo }: Props) => {
    if (roster) {
        return (
            <ListGroup>
                {roster.map((user) => {
                    return (
                        <ListGroupItem key={user.participantId}>
                            <strong>{user.displayName}</strong>
                            <DialogRenderProp
                                renderTitle={() => 'Edit Participant'}
                                renderButton={() => <FaEdit />}
                                renderBody={(onComplete) => (
                                    <EditParticipantForm
                                        user={user}
                                        onComplete={onComplete}
                                        onSubmit={(updates) => {
                                            updateUserInfo(user.participantId, updates);
                                        }}
                                    />
                                )}
                            />
                            <div>
                                <small>
                                    <em>Email</em>: {user.email}
                                </small>
                            </div>
                            <div>
                                <small>
                                    <em>Number:</em> {user.contactNumber}
                                </small>
                            </div>
                        </ListGroupItem>
                    );
                })}
            </ListGroup>
        );
    } else {
        return <div>Roster not found</div>;
    }
};
