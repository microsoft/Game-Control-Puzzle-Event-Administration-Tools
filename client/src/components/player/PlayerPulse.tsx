import { Col, Row, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux'
import * as moment from 'moment';

import * as constants from '../../constants';
import { getFeedModule } from 'modules/player'
import { AggregatedContent } from "modules/types/models";

import { PulseControl } from '../shared/PulseControl'
import { PulseTemplate } from 'modules/player/feed/models';
import { submitPhotoPulse, submitPulse } from 'modules/player/feed';

const PulsePic = ({ pulse }: { pulse?: AggregatedContent }) => {
    if (pulse?.hasAdditionalImage) {
        return <img alt="" src={`${constants.APPLICATION_URL}api/content/pulseThumb/${pulse.id}`}/>;
    }

    return null;
};

const LastSuccessfulPulse = ({ pulse }: { pulse?: AggregatedContent }) => {
    if (pulse) {
        return (
            <div>
                <h5>Successfully submitted pulse</h5>
                <Card>
                    <div>
                        <Row>
                            <Col xs={8} md={8} style={{textAlign: "left"}}>
                                <div>{pulse.description}</div>
                                <PulsePic pulse={pulse} />
                            </Col>
                            <Col xs={4} md={4} style={{textAlign: "right"}}>
                                <div><small>Pulse</small></div>
                                <div><small>{moment.utc(pulse.lastUpdated).fromNow()}</small></div>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </div>
        );
    }

    return null;
}

export const PlayerPulse = () => {
    document.title = "The Pulse";
    const feedState = useSelector(getFeedModule);
    const dispatch = useDispatch();

    const handlePulse = (pulseTemplate: PulseTemplate) => {
        if (!pulseTemplate.pulseImage) {
            dispatch(submitPulse(pulseTemplate));
        } else {
            dispatch(submitPhotoPulse(pulseTemplate));
        }
    }

    return (
        <div>
            <h2>The Pulse</h2>
            <PulseControl 
                isBusy={feedState.isSubmittingPulse}
                onSubmit={handlePulse}/>
            <LastSuccessfulPulse pulse={feedState.lastPulse}/>
        </div>
    );
}
