import { PlayerClue, PlayerClueState } from "./models";

export const getPlayerClues = (state: any): PlayerClueState => state.player.clues;

export const getClueDetails = (state: any, tableOfContentId: string): PlayerClue | undefined => {
    return getPlayerClues(state).data.find(clue => clue.tableOfContentId ===tableOfContentId) ?? undefined;
};