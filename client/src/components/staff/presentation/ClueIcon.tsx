import { FaBookOpen, FaMapPin, FaPuzzlePiece } from 'react-icons/fa';
import { StaffClue } from 'modules/staff/clues';

export const ClueIcon = ({ clue, className }: { clue: StaffClue, className?: string }) => {
    if (clue.submittableType === "Puzzle") {
        return <FaPuzzlePiece className={className} />
    } else if (clue.submittableType === "Plot") {
        return <FaBookOpen  className={className}/>
    } else if (clue.submittableType === "LocUnlock") {
        return <FaMapPin  className={className}/>
    }

    return null;
}