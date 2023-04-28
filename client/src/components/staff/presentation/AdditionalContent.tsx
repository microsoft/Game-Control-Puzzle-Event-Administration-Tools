import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import _ from 'lodash';

import { Content } from "modules/types";

type ContentProps = Readonly<{
    content: Content;
}>;

const TextContent = ({ content }: ContentProps) => {
    if (content.stringContent.startsWith("https")) {
        return (
            <>
                <a href={content.stringContent}>{content.stringContent}</a>
            </>
        )
    } else {
        return (
            <>
                <div>{content.stringContent}</div>
            </>
        )
    }
};

const HtmlContent = ({ content }: ContentProps) => {
    return (
        <div className="web-content" dangerouslySetInnerHTML={{__html: content.stringContent}}/>
    )
};


const LocationContent = ({ content }: ContentProps) => {
    return (
        <>
            <div>
                <img
                    alt={content.name}
                    src={"https://dev.virtualearth.net/REST/v1/Imagery/Map/Road?centerPoint=" + content.latitude + "," + content.longitude + "&mapSize=280,180&pushpin=" + content.latitude + "," + content.longitude + "&key=AuyOR02DEFnwiMP6JtAl7NGv13blWWydEy_fQI9qZoCZ5Y_E99Hdb-JTEL9g3Y9Z"} />
            </div>
            <div>{content.address}</div>
            <div>{content.latitude} {content.longitude}</div>
        </>
    );
};

const HyperlinkContent = ({ content }: ContentProps) => {
    return (
        <>
            <a href={content.stringContent} className="btn btn-info">{content.name}<FiExternalLink className="ml-2"/></a>
        </>
    )
};

const ImageContent = ({ content }: ContentProps) => {
    return (
        <>
            <img alt={content.name}
                src={content.stringContent} />
        </>
    );
};

const YoutubeContent = ({ content }: ContentProps) => {
    return (
        <>
            <iframe src={content.stringContent}
                height="210"
                width="315"
                frameBorder="0"
                allowFullScreen
                title={content.name}>
            </iframe>
            <br />
            <a href={content.stringContent}>Click here to view on YouTube</a>
        </>
    );
};

type AdditionalContentProps = Readonly<{
    content: Content;
    teamId?: string;
    playerId?: string;
}>;

export const AdditionalContent = ({ content, teamId, playerId }: AdditionalContentProps) => {
    let tokenReplacedContent = { ...content };
    let teamShortName = useSelector(store => _.get(store, "user.teamShortName"));

    if (tokenReplacedContent.stringContent && teamId) {
        tokenReplacedContent.stringContent = tokenReplacedContent.stringContent.replace(/\[\[team\]\]/g, teamId);
    }
    if (tokenReplacedContent.stringContent && playerId) {
        tokenReplacedContent.stringContent = tokenReplacedContent.stringContent.replace(/\[\[player\]\]/g, playerId);
    }
    if (tokenReplacedContent.stringContent && teamShortName) {
        tokenReplacedContent.stringContent = tokenReplacedContent.stringContent.replace(/\[\[shortname\]\]/g, teamShortName.trim());
        tokenReplacedContent.stringContent = tokenReplacedContent.stringContent.replace(/\[\[shortName\]\]/g, teamShortName.trim());
    }

    if (content.contentType.trim() === "PlainText") {
        return <TextContent content={tokenReplacedContent} />
    } else if (content.contentType.trim() === "RichText") {
        return <HtmlContent content={tokenReplacedContent} />
    } else if (content.contentType.trim() === "Location") {
        return <LocationContent content={tokenReplacedContent} />
    } else if (content.contentType.trim() === "Hyperlink") {
        return <HyperlinkContent content={tokenReplacedContent} />
    } else if (content.contentType.trim() === "Image") {
        return <ImageContent content={tokenReplacedContent} />
    } else if (content.contentType.trim() === "YoutubeUrl") {
        return <YoutubeContent content={tokenReplacedContent} />
    }
    
    return <></>;
};