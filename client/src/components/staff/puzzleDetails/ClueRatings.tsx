import { ClueRating } from 'modules/staff/clues';
import PuzzleRatingList from '../presentation/PuzzleRatingList';

type Props = Readonly<{ ratings: ClueRating[] }>;

export const ClueRatings = ({ ratings }: Props) => {
    if (ratings && ratings.length > 0) {
        return (
            <div>
                <h4>Player Ratings</h4>
                <div>
                    <PuzzleRatingList ratings={ratings} />
                </div>
            </div>
        );
    } else {
        return <div>No ratings are available</div>;
    }
};
