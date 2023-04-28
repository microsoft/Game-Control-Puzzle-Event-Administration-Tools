import { Module } from "modules/types";
import { TeamData } from "./models";

export const getTeamModule = (state: any): Module<TeamData> => state.player.team;