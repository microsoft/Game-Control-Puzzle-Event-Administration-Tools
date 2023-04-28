import { FeedState } from "./models";

export const getFeedModule = (state: any): FeedState => state.player.feed;
