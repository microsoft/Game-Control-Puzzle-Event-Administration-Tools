export type NewParticipantTemplate = Readonly<{
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    teamId?: string;
    isStaff: boolean;
    isAdmin: boolean;
    login?: string;
    password?: string;
}>;

export type EditParticipantTemplate = Readonly<{
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
}>;