import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

type Props = Readonly<{
    renderTitle: () => string;
    renderButton: () => JSX.Element;
    renderBody: (onComplete: () => void) => JSX.Element;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'lg';
}>;

const DialogRenderProp = ({ renderTitle, renderButton, renderBody, variant = 'default', disabled = false, className = undefined, size = undefined }: Props) => {
    const [showDialog, setShowDialog] = useState(false);

    return (
        <>
            <Button className={className} size={size} disabled={disabled} variant={variant} onClick={() => setShowDialog(true)}>
                <span title={renderTitle()}>{renderButton()}</span>
            </Button>
            <Modal show={showDialog} onHide={() => setShowDialog(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{renderTitle()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{renderBody(() => setShowDialog(false))}</Modal.Body>
            </Modal>
        </>
    );
};

export default DialogRenderProp;
