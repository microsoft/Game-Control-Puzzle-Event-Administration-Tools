import React from 'react'
import { connect } from 'react-redux'
import * as moment from 'moment'

import { ListGroup, ListGroupItem } from 'react-bootstrap'

class UserAccount extends React.Component {
    renderParticipationHistory(user) {
        if (user !== null && user.participation !== null) {
            // TODO: Should probably triple check that we have a valid start and end time.
            return <ListGroup>
                    {user.participation.map(participation => 
                        <ListGroupItem 
                            key={participation.participationId}
                            header={participation.eventFriendlyName}>
                            {moment(participation.eventStartTime).format('LL')} - {moment(participation.eventEndTime).format('LL')}
                        </ListGroupItem>)}
                </ListGroup>;
        } else {
            return <div>User has not participated in any events</div>;
        }
    }
    
    render() {
        return <div>
                <div>User account details go here</div>
                {this.renderParticipationHistory(this.props.user.data)}
            </div>;
    }
}

const mapStateToProps = state => ({
    user: state.user
})

export default connect(mapStateToProps)(UserAccount)