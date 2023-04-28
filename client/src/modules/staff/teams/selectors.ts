import { StaffTeam, StaffTeamState } from './models';

export const getStaffTeams = (state: any): StaffTeamState => state.staff.teams;

export const getStaffTeam = (state: any, teamId?: string)=> teamId ? getStaffTeams(state).data.find((team: StaffTeam) => team.teamId === teamId) : undefined;
