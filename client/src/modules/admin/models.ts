import { Moment } from 'moment';

/**
 * Event Instance represents a specific "run" of an event, such as
 * a beta run to test out logistics or the main event itself.
 */
export type EventInstance = Readonly<{
    eventInstanceId: string;
    event: string;
    eventType: string;
    friendlyName: string;
    startTime: Moment;
    endTime: Moment;
}>;

/**
 * A Participant represents the basic data for a user. This user can be
 * reused across multiple runs of an event or multiple events.
 */
export type Participant = Readonly<{
    participantId: string;
    contactNumber?: string;
    email?: string;
    firstName: string;
    lastName?: string;
    displayName: string;
    participation: Participation[];
}>;

/**
 * Participation links a user to a specific event instance and role, for example
 * indicating whether they are a player on a team or a member of staff.
 */
export type Participation = Readonly<{
    eventInstanceId: string;
    participationId: string;
    eventFriendlyName: string;
    eventStartTime: Moment;
    eventEndTime: Moment;
    teamId?: string;
    teamName?: string;
    isStaff: boolean;
    isAdmin: boolean;
}>;

/**
 * Template object for updating a user's current role for an event
 */
export type ParticipationTemplate = Readonly<{
    isStaff: boolean;
    isAdmin: boolean;
    teamId?: string;
}>;

/**
 * API Keys allow external services to call into the primary service. These
 * are scoped to a specific event instance.
 */
export type ApiKey = Readonly<{
    id: number;
    name: string;
    keyValue: string;
    eventInstance: string;
    lastUpdated: Moment;
}>;
