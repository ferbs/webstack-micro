import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


export function ButtonWithConfirmationModal({ button, buttonClassName, onConfirm, ...confirmationDialogProps }) {
  const [ isOpen, setIsOpen] = React.useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const buttonToShowDialogButtonProps = {
    variant: 'outlined',
    color: 'primary',
    className: buttonClassName,
    onClick: handleOpen,
  };
  if (typeof button === 'function') {
    button = button(buttonToShowDialogButtonProps);
  } else if (typeof button === 'string') {
    button = <Button
      { ...buttonToShowDialogButtonProps }
    >{ button }</Button>;
  }

  const closeOnConfirm = () => {
    onConfirm();
    handleClose();
  };
  return <>
    { button }

    <ConfirmationDialog
      { ...confirmationDialogProps }
      isOpen={isOpen}
      handleClose={handleClose}
      onConfirm={closeOnConfirm}
    />
  </>;
}

// mostly copied from example in docs: https://material-ui.com/components/dialogs/
export function ConfirmationDialog({ title, content, continueButtonText, cancelButtonText, isOpen, handleClose, onConfirm }) {
  return <Dialog
    open={isOpen}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      {title || 'Are you sure?'}
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        { content || null}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary" autoFocus>
        { cancelButtonText || 'Cancel' }
      </Button>
      <Button onClick={onConfirm} color="primary" >
        { continueButtonText || 'Continue' }
      </Button>
    </DialogActions>
  </Dialog>;
}