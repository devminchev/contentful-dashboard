import { Modal, Button } from '@contentful/f36-components';

export const ConfirmModal = ({ isShown, title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) => (
    <Modal isShown={isShown} onClose={onCancel}>
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content>
            {message}
        </Modal.Content>
        <Modal.Controls>
            <Button variant="negative" onClick={onCancel}>{cancelText}</Button>
            <Button variant="positive" onClick={onConfirm}>{confirmText}</Button>
        </Modal.Controls>
    </Modal>
);
