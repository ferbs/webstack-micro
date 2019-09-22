import React from 'react';
import useForm from 'react-hook-form';
import { compact } from 'lodash';
import { Button } from '@material-ui/core';
import useStyles from './ElementsForm.style';
import {FormTextarea} from "../components/form-fields";


const DefaultElements = [ 'Nectarine', 'Fig', 'Mangosteen', 'Cherry', 'Mango' ];


export default function ElementsForm({ initialElements, postToWorker, error }) {

  const { register, handleSubmit, setError } = useForm(); // todo: also errors
  const onSubmit = (formData) => {
    const { rawText } = formData;
    const elements = compact(rawText.split('\n'));
    if (!elements || elements.length < 2) {
      setError('rawText', 'Expecting 2 or more elements');
    } else {
      postToWorker(elements).then(jobId => {
      }).catch((err) => {
        setError('rawText', err.message || 'Unknown error')
      });
    }
  };

  const errorMessage = error && (error.message || error.errorCode); // todo: convert errorCode into human msg
  if (errorMessage) {
    setError('rawText', errorMessage);
  }
  const classes = useStyles();
  const elements = Array.isArray(initialElements) ? initialElements : DefaultElements;
  return <form
    onSubmit={handleSubmit(onSubmit)}
    className={classes.aiForm}
  >
    <FormTextarea
      name="rawText"
      label="Modify list elements:"
      className={classes.smartList}
      register={register}
      rows={6}
      aria-label="list to sort"
      variant="filled"
      defaultValue={ elements.join('\n') }
    />
    <Button
      type="submit"
      variant="contained"
      color="primary"
    >Sort Using Advanced AI Algorithm In Background Worker</Button>
  </form>
}

// variant="outlined"
// helperText=
