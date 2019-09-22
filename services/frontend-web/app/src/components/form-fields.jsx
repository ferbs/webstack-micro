import React from 'react';
// import { Link as NavLink } from '@reach/router';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { TextField } from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  textField: {
    marginTop: theme.spacing(2)
  },
}));

export function FormTextField({ name, register, errors, formOpts, className, ...props }) {
  const classes = useStyles();
  const errorMessage = errors && errors[name] && errors[name].message;
  const fieldProps = {
    inputRef: ref => register(ref, formOpts || {}),
    fullWidth: true,
    type: 'text',
    error: !!errorMessage,
    helperText: errorMessage || props.helperText,
    name,
    className: clsx(classes.textField, className),
    ...props,
  };

  return <TextField { ...fieldProps } />;
}


export function FormTextarea(props) {
  return <FormTextField
    multiline={true}
    { ...props }
  />;
}