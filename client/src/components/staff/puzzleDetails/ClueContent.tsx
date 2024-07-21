import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { FaEdit, FaTrashAlt, FaAngleDoubleUp } from 'react-icons/fa';
import moment from "moment";

import { Content, SkipPlot, SolvedPlot, UnsolvedPlot } from "modules/types";
import { ContentTemplate, LocationTemplate } from "modules/staff/clues";

import DialogRenderProp from '../dialogs/DialogRenderProp';
import { ContentForm, LocationForm } from '../dialogs';
import { AdditionalContent } from "../presentation/AdditionalContent";

type Props = Readonly<{
    content: Content[];
    tableOfContentId: string;
    addContentToClue: (tableOfContentId: string, contentTemplate: ContentTemplate) => void;
    addLocationToClue: (tableOfContentId: string, locationTemplate: LocationTemplate) => void;
    deleteContent: (tableOfContentId: string, contentId: string) => void;
}>;

type ActionProps = Readonly<{
    contentItem: Content;
    tableOfContentId: string;
    addContentToClue: (tableOfContentId: string, contentTemplate: ContentTemplate) => void;
    addLocationToClue: (tableOfContentId: string, locationTemplate: LocationTemplate) => void;
    deleteContent: (tableOfContentId: string, contentId: string) => void;
}>;

const ContentActions = ({ addContentToClue, addLocationToClue, deleteContent, tableOfContentId, contentItem }: ActionProps) => {
    return (
        <Row>
            <Col style={{ alignContent: 'center' }}>
                <DialogRenderProp 
                        className="m-2"
                        variant="outline-primary"
                        renderTitle={() => "Edit puzzle content"}
                        renderButton={() => <><FaEdit className="mr-2"/> Edit Content</>}
                        renderBody={(onComplete: () => void) => {
                            if (contentItem.contentType === 'Location') {
                                return (
                                    <LocationForm
                                        location={contentItem}
                                        onSubmit={content => {
                                            addLocationToClue(tableOfContentId, content);
                                            onComplete();
                                        }}
                                    />
                                );
                            } else {
                                return (
                                    <ContentForm
                                        content={contentItem}
                                        onSubmit={content => {
                                            addContentToClue(tableOfContentId, content);
                                            onComplete();
                                        }}
                                    />
                                    );
                                }
                            }
                    }
                    />
                <Button variant="outline-danger" className="m-2" onClick={() => deleteContent(tableOfContentId, contentItem.contentId)}>
                    <FaTrashAlt className="mr-2"/>Delete
                </Button>
                <Button variant="outline-primary" className="m-2" onClick={() => contentItem.contentType === "Location" ? addLocationToClue(tableOfContentId, { name: contentItem.name, locationId: contentItem.contentId, address: contentItem.address ?? "", latitude: contentItem.latitude!, longitude: contentItem.longitude!, locationFlags: contentItem.locationFlags ?? 0 }) : addContentToClue(tableOfContentId, { ...contentItem, contentName: contentItem.name })}>
                    <FaAngleDoubleUp className="mr-2"/> Move to Top
                </Button>
            </Col>
        </Row>
    );
};

type ContentCardProps = Readonly<{
    title: string;
    description: JSX.Element;
    contentList: Content[];
    tableOfContentId: string;
    addContentToClue: (tableOfContentId: string, contentTemplate: ContentTemplate) => void;
    addLocationToClue: (tableOfContentId: string, locationTemplate: LocationTemplate) => void;
    deleteContent: (tableOfContentId: string, contentId: string) => void;
}>;

const ContentCard = ({ title, description, contentList, tableOfContentId, addContentToClue, addLocationToClue, deleteContent }: ContentCardProps) => {
    if (contentList.length > 0) {
        return (
            <Card style={{ justifySelf: "center", margin: "40px" }}>
                <Card.Header>
                    <div>{title}</div>
                    <div style={{ fontSize: "12" }}>{description}</div>    
                </Card.Header>
                <Card.Text>
                    <Container fluid>
                        {contentList.map(content =>
                        {
                            let unlockedByAchievementElement = <></>;
                            if (!!content.achievementUnlockId)
                            {
                                unlockedByAchievementElement = <>
                                    <h6>Unlocked By Achievement:</h6>
                                    <p>{content.achievementUnlockId}</p>
                                </>
                            }

                            <>
                                <Row style={{ margin: "15px" }}>
                                    <AdditionalContent content={content}/>
                                </Row>
                                {unlockedByAchievementElement}
                                <ContentActions
                                    addContentToClue={addContentToClue}
                                    addLocationToClue={addLocationToClue} 
                                    deleteContent={deleteContent}
                                    tableOfContentId={tableOfContentId}
                                    contentItem={content} />
                            </>
                        })}
                    </Container>
                </Card.Text>
            </Card>
        );
    } else {
        return null;
    }
};

export const StaffClueContent = ({ content, tableOfContentId, addContentToClue, addLocationToClue, deleteContent }: Props) => {
    const sortedContent = content.sort((a, b) => moment.utc(b.lastUpdated).diff(moment.utc(a.lastUpdated)));

    if (content.length > 0) {
        const unsolvedPlotContent = sortedContent.filter(x => x.name === UnsolvedPlot);
        const solvedPlotContent = sortedContent.filter(x => x.name === SolvedPlot);
        const skippedPlotContent = sortedContent.filter(x => x.name === SkipPlot);
        const otherContent = sortedContent.filter(x => x.name !== UnsolvedPlot && x.name !== SolvedPlot && x.name !== SkipPlot);

        return (
            <>
                <ContentCard
                    title="Unsolved Plot"
                    description={<em>Teams will see this on both the home page and puzzle page, but only when the puzzle is <strong>unsolved</strong>.</em>}
                    contentList={unsolvedPlotContent}
                    tableOfContentId={tableOfContentId}
                    addContentToClue={addContentToClue}
                    addLocationToClue={addLocationToClue}
                    deleteContent={deleteContent}
                />

                <ContentCard
                    title="Solved Plot"
                    description={<em>Teams will see this on both the home page and puzzle page, but only when the puzzle is <strong>solved</strong>.</em>}
                    contentList={solvedPlotContent}
                    tableOfContentId={tableOfContentId}
                    addContentToClue={addContentToClue}
                    addLocationToClue={addLocationToClue}
                    deleteContent={deleteContent}
                />

                <ContentCard
                    title="Skip Plot"
                    description={<em>If a team is <strong>skipped</strong> over this clue, they will see this on the home page, but this clue will not show up on all clues.</em>}
                    contentList={skippedPlotContent}
                    tableOfContentId={tableOfContentId}
                    addContentToClue={addContentToClue}
                    addLocationToClue={addLocationToClue}
                    deleteContent={deleteContent}
                />

                <ContentCard
                    title="Other Content"
                    description={<em>Teams will only see this on the puzzle page, regardless of solve status</em>}
                    contentList={otherContent}
                    tableOfContentId={tableOfContentId}
                    addContentToClue={addContentToClue}
                    addLocationToClue={addLocationToClue}
                    deleteContent={deleteContent}
                />
            </>
        );
    } else {
        return (
            <div>There is no additional content for this clue.</div>
        )
    }
};