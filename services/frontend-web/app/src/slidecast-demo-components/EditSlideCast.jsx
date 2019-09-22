import React from 'react';
import useForm from 'react-hook-form';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import {splitMarkdownIntoSlides} from "../demo-support/markdown-support";
import getDemoMarkdownContent from '../demo-support/demo-markdown-content';
import {FormTextarea, FormTextField} from "../components/form-fields";
import useStyles from './EditSlideCast.style';


export default function EditSlideCast({ savePreso, closeEditor, slides, title, canCancel }) {

  const { register, errors, setError, setValue, handleSubmit } = useForm();
  const sharedFormFieldProps = { register, errors, fullWidth: true };

  const onSubmit = (formData) => {
    const { title, presoMarkdown } = formData;
    const slides = splitMarkdownIntoSlides(presoMarkdown);
    savePreso({ title, slides })
      .then(() => closeEditor())
      .catch(err => {
        setError('slides', err.errorMessage || err.errorCode); // todo: better validation errors
      });
  };

  const classes = useStyles();
  
  return <Dialog
    open={true}
    onClose={closeEditor}
    aria-labelledby="form-dialog-title"
    fullWidth={true}
    maxWidth={false}
    PaperProps={{ className: classes.modalDialogPaper }}
  >
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      <DialogTitle id="form-dialog-title">Edit SlideCast</DialogTitle>
      <DialogContent>
        <FormTextField
          name="title"
          formOpts={{ required: 'Required field' }}
          label="Title"
          defaultValue={title || 'My Markdown SlideCast'}
          required
          maxLength={64}
          { ...sharedFormFieldProps }
        />
        <FormTextarea
          name="presoMarkdown"
          id="preso-markdown"
          aria-label="preso-markdown"
          defaultValue={ (slides || []).join('\n\n') }
          className={classes.editMarkdown}
          label="Markdown for entire SlideCast"
          variant="outlined"
          rows={8}
          helperText={ `Paste in your markdown content. It will be split into slides using major headers as break points. (eg, "# Main Title" and "## Another Section")`}
          { ...sharedFormFieldProps }
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(evt) => {
            evt.stopPropagation();
            setValue('presoMarkdown', getDemoMarkdownContent());
            evt.target.blur();
          }}
          color="secondary"
        >Fill with demo markdown content</Button>
        
        {canCancel &&
        <Button onClick={closeEditor} color="primary">
          Cancel
        </Button>
        }
        <Button
          type="submit"
          color="primary"
        >
          Submit
        </Button>
      </DialogActions>
    </form>
  </Dialog>;
}
