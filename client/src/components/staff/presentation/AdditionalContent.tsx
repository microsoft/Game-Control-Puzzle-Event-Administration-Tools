import { FiExternalLink } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { Achievement, Content } from 'modules/types';

type ContentProps = Readonly<{
    content: Content;
}>;

const TextContent = ({ content }: ContentProps) => {
    if (content.stringContent.startsWith('https')) {
        return (
            <>
                <a href={content.stringContent}>{content.stringContent}</a>
            </>
        );
    } else {
        return (
            <>
                <div>{content.stringContent}</div>
            </>
        );
    }
};

const HtmlContent = ({ content }: ContentProps) => {
    return <div className="web-content" dangerouslySetInnerHTML={{ __html: content.stringContent }} />;
};

const LocationContent = ({ content }: ContentProps) => {
    // Create Bing Maps URL with the location coordinates
    const bingMapsUrlLatLong = `https://www.bing.com/maps/default.aspx?lvl=18&cp=${content.latitude}~${content.longitude}`;
    const bingMapsUrlAddress = `https://www.bing.com/maps/default.aspx?&where1=${content.address}`;

    return (
        <>
            <div>
                <a href={bingMapsUrlAddress} target="_blank" rel="noopener noreferrer">
                    {content.address}
                </a>
            </div>
            <div>
                <a href={bingMapsUrlLatLong} target="_blank" rel="noopener noreferrer">
                    {content.latitude} {content.longitude}
                </a>
            </div>
        </>
    );
};

const HyperlinkContent = ({ content }: ContentProps) => {
    return (
        <>
            <a href={content.stringContent} className="btn btn-info">
                {content.name}
                <FiExternalLink className="ml-2" />
            </a>
        </>
    );
};

const ImageContent = ({ content }: ContentProps) => {
    return (
        <>
            <img alt={content.name} src={content.stringContent} />
        </>
    );
};

const YoutubeContent = ({ content }: ContentProps) => {
    return (
        <>
            <iframe src={content.stringContent} height="210" width="315" frameBorder="0" allowFullScreen title={content.name}></iframe>
            <br />
            <a href={content.stringContent}>Click here to view on YouTube</a>
        </>
    );
};

type AdditionalContentProps = Readonly<{
    content: Content;
    teamId?: string;
    playerId?: string;
    achievements?: Achievement[];
}>;

export const AdditionalContent = ({ content, teamId, playerId, achievements }: AdditionalContentProps) => {
    let tokenReplacedContent = { ...content };
    let teamShortName = useSelector((store: any) => store.user.teamShortName);

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

    let returnContent = <></>;
    if (content.contentType.trim() === 'PlainText') {
        returnContent = <TextContent content={tokenReplacedContent} />;
    } else if (content.contentType.trim() === 'RichText') {
        returnContent = <HtmlContent content={tokenReplacedContent} />;
    } else if (content.contentType.trim() === 'Location') {
        returnContent = <LocationContent content={tokenReplacedContent} />;
    } else if (content.contentType.trim() === 'Hyperlink') {
        returnContent = <HyperlinkContent content={tokenReplacedContent} />;
    } else if (content.contentType.trim() === 'Image') {
        returnContent = <ImageContent content={tokenReplacedContent} />;
    } else if (content.contentType.trim() === 'YoutubeUrl') {
        returnContent = <YoutubeContent content={tokenReplacedContent} />;
    }

    let matchingAchievement = undefined;
    if (content.achievementUnlockId && achievements) {
        matchingAchievement = achievements.find((achievement) => achievement.achievementId === content.achievementUnlockId);
    }

    if (matchingAchievement) {
        return (
            <div>
                {returnContent}
                <br />
                <b>NOTE: The above content is unlocked by achievement:</b>
                <p>{matchingAchievement.name}</p>
            </div>
        );
    } else {
        return returnContent;
    }
};
