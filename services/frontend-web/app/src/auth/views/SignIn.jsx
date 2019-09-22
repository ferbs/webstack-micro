import React from 'react';
import { navigate } from '@reach/router'
import useForm from 'react-hook-form';
import { get as get_ } from 'lodash';
import { Grid, Button, FormControl, Typography, Divider, InputLabel } from '@material-ui/core';
import * as AuthApi from '../auth-api'
import StandardLayout from '../../layouts/StandardLayout';
import useAuthContext from '../auth-context';
import useStyles from './SignIn.style';
import FacebookIcon from '../../assets/icons/FacebookIcon';
import GoogleIcon from '../../assets/icons/GoogleIcon';
import GithubIcon from '../../assets/icons/GithubIcon';
import {FormTextField} from "../../components/form-fields";
import { OpenIdConnectHrefByProvider, EnvVars } from '../../config'


export default function SignInView() {
  const classes = useStyles();
  const { isLoggedIn, setAuthUserState, setConnectionErrorState } = useAuthContext();
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/app/dashboard');
    }
  }, [ isLoggedIn ]);
  const { hasLocalPasswordLogin, isDevMode } = EnvVars;
  const hasOpenIdLogin = !!Object.keys(OpenIdConnectHrefByProvider).length;
  const passwordProps = { classes, setAuthUserState, setConnectionErrorState, hasOpenIdLogin };
  const openIdProps = {
    OpenIdConnectHrefByProvider,
    classes,
  };

  return <StandardLayout skipSignInOut={true}>
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.contentBody}>
          <Grid
            className={classes.grid}
            container
            justify="center"
          >
            <Grid
              className={classes.content}
              item
              xs={10} sm={6} md={4}
            >
              <Typography
                className={classes.contentHeader}
                variant="h2"
              >
                Sign in
              </Typography>

              { hasOpenIdLogin && <>
                <OpenIdLogin {...openIdProps } />
                <Divider
                  className={classes.divider}
                  variant="middle"
                />
              </>}
              { hasLocalPasswordLogin &&
              <PasswordSignIn {...passwordProps } isDevMode={isDevMode} />
              }
            </Grid>
          </Grid>
        </div>
      </div>
    </div>

  </StandardLayout>;
}


function OpenIdLogin({ classes, OpenIdConnectHrefByProvider  }) {
  const { github, facebook, google } = OpenIdConnectHrefByProvider || {};
  const renderOpenIdButton = (href, content) => {
    if (!href || !content) {
      return null;
    }
    return <FormControl fullWidth>
      <Button
        href={ href }
        size="large"
        variant="outlined"
        fullWidth
      >
        { content }
      </Button>
    </FormControl>
  };

  return <div
    className={classes.socialButtons}
  >
    { github && renderOpenIdButton(github, <><GithubIcon className={classes.socialIcon} /> Sign in with GitHub</>) }
    { google && renderOpenIdButton(google, <><GoogleIcon className={classes.socialIcon} /> Sign in with Google</>) }
    { facebook && renderOpenIdButton(facebook, <><FacebookIcon className={classes.socialIcon} /> Sign in with Facebook</>) }
  </div>;
}


function PasswordSignIn({ classes, setAuthUserState, setConnectionErrorState, isDevMode }) {
  const { register, handleSubmit, clearError, errors, setError } = useForm();


  const onSubmit = data => {
    const { email, password } = data;
    AuthApi.signIn(email, password).then((result={}) => {
      clearError();
      if (result.authUserId) {
        setAuthUserState(result);
        navigate('/app/dashboard');
      } else {
        const errorMessage = get_(result, 'validationErrors[0].message') || 'Unknown Error'; // could also check errorCode (eg, "InvalidCredentials"). todo: move all errorCodes into shared-constants
        setError('form', 'invalid', errorMessage);
      }
    }).catch(err => {
      console.warn('Connection error', err);
      setConnectionErrorState(true);
    });
  };

  const inputFields = {
    register, errors,
    fullWidth: true,
  };

  const devModeTip = isDevMode && '# You can create a dev-mode login account with:\nbin/dev.sh run passportjs-auth bin/create-dev-user.js \\\n  dev@email.loc secret! Some Name';

  return <form
    className={classes.form}
    onSubmit={handleSubmit(onSubmit)}
  >
    { errors && errors.form && <InputLabel error={true} className={classes.formLevelError}>{errors.form.message}</InputLabel> }

    <FormTextField
      name="email"
      formOpts={{ required: 'Required field' }}
      label="Email address"
      variant="outlined"
      { ...inputFields }
    />
    <FormTextField
      name="password"
      type="password"
      formOpts={{ required: 'Required field' }}
      register={register}
      label="Password"
      variant="outlined"
      { ...inputFields }
    />

    <Button
      className={classes.signInButton}
      color="primary"
      // disabled={!formState.isValid}
      fullWidth
      size="large"
      type="submit"
      variant="outlined"
    >
      Sign in
    </Button>

    { devModeTip &&
    <div className={classes.devModeLocalSigninTips}>
        <pre>{ devModeTip }</pre>
    </div>
    }
  </form>;
}


