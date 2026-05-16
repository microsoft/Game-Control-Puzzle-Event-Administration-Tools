import { Content } from './models';

export const isContentEqual = (content1: Content, content2: Content) => {
    if (content1 == null || content2 == null) {
        if (content1 == null && content2 == null) {
            return true;
        }
        return false;
    }

    if (content1.address !== content2.address) {
        return false;
    }
    if (content1.contentId !== content2.contentId) {
        return false;
    }
    if (content1.contentType !== content2.contentType) {
        return false;
    }
    if (content1.latitude !== content2.latitude) {
        return false;
    }
    if (content1.locationFlags !== content2.locationFlags) {
        return false;
    }
    if (content1.longitude !== content2.longitude) {
        return false;
    }
    if (content1.name !== content2.name) {
        return false;
    }
    if (content1.stringContent !== content2.stringContent) {
        return false;
    }

    return true;
};
