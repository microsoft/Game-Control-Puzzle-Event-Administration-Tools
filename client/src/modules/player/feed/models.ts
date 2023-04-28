import { AggregatedContent, Module } from "modules/types";

export type PulseTemplate = Readonly<{
    pulseText: string;
    pulseRating: number;
    pulseImage: any;
}>;

export type FeedState = Readonly<{
    isSubmittingPulse: boolean;
    lastPulse?: AggregatedContent;
}> & Module<AggregatedContent[]>;