import React, { useCallback, useEffect, useState } from 'react';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

export const LiveTimerControl = ({ timestamp }) => {
    const [displayTime, setDisplayTime] = useState();
    const [minutes, setMinutes] = useState();

    const updateTime = useCallback(() => {
        const delta = timestamp ? moment.duration(moment.utc().diff(moment.utc(timestamp))) : undefined;
        setMinutes((delta !== undefined && delta !== null) ? Math.round(delta.asMinutes()) : undefined);

        if (!delta) {
            setDisplayTime("Unknown");
        }
        else {
            setDisplayTime(humanizeDuration(delta.asMilliseconds(), { largest: 2, round: true }));
        }
    }, [timestamp]);

    useEffect(() => {
        updateTime();
        
        if (minutes)
        {
            let interval = 15000;
            if (minutes < 5)
            {
                interval = 500;
            }
            else if (minutes < 60)
            {
                interval = 1000;
            }

            const timer = setInterval(() => updateTime(), interval);
            return () => clearInterval(timer);
        }
    }, [minutes, timestamp, updateTime]);

    return (<>{displayTime}</>);
}