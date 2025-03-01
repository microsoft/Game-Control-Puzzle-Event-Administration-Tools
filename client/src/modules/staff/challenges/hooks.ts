import moment from 'moment';
import 'moment-timezone';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Challenge, ChallengeApproval, ChallengeTemplate } from './models';
import { getChallenges, updateChallengeSubmission, addChallenge } from './service';
import { Module } from 'modules/types';

export const getChallengesModule = (state: any): Module<Challenge[]> => state.staff.challenges;

export function shouldRefreshChallenges(challengeModule: Module<Challenge[]>) {
    return !challengeModule.isLoading && (!challengeModule.lastFetched || moment.utc().diff(challengeModule.lastFetched, 'seconds') > 60);
}

export const useStaffChallenges = () => {
    const dispatch = useDispatch();
    const challengesModule = useSelector(getChallengesModule);

    // Refresh the challenges list on mount
    useEffect(() => {
        if (shouldRefreshChallenges(challengesModule)) {
            dispatch(getChallenges());
        }
    }, [challengesModule, dispatch]);

    return {
        challengesModule,
        addChallenge: (challenge: ChallengeTemplate) => dispatch(addChallenge(challenge)),
    };
};

export const useStaffChallengeDetails = (challengeId: string) => {
    const dispatch = useDispatch();
    const challengesModule = useSelector(getChallengesModule);

    // Refresh the challenges list on mount
    useEffect(() => {
        if (shouldRefreshChallenges(challengesModule)) {
            dispatch(getChallenges());
        }
    }, [challengesModule, dispatch]);

    return {
        challenge: challengesModule.data.find((x: Challenge) => x.challengeId === challengeId),
        updateChallenge: (challenge: ChallengeTemplate) => dispatch(addChallenge(challenge)),
        updateApproval: (submission: ChallengeApproval) => dispatch(updateChallengeSubmission(challengeId, submission)),
    };
};
