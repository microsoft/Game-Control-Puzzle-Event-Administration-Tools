import { PlayerChallengeState } from "./models";

export const getPlayerChallenges = (state: any): PlayerChallengeState => state.player.challenges;