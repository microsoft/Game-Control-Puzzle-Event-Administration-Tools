import Axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import * as constants from '../../constants';

Axios.defaults.baseURL = constants.APPLICATION_URL;

export const useStaffClues = (eventInstanceId: string) =>
    useQuery({
        queryKey: ['staff', 'clues'],
        queryFn: async () => {
            const response = await Axios.get(`/api/staff/puzzles/${eventInstanceId}`);
            return response.data;
        },
    });

export const useStaffClueDetails = (eventInstanceId: string, tableOfContentsId: string) =>
    useQuery({
        queryKey: ['staff', 'clues', tableOfContentsId],
        queryFn: async () => {
            const response = await Axios.get(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentsId}`);
            return response.data;
        },
    });
