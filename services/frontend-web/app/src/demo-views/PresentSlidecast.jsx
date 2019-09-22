import React from 'react';
import { CircularProgress } from '@material-ui/core';
import asStateAssigment from "../util/assign-state-util";
import StandardLayout from "../layouts/StandardLayout";
import {displaySlide, fetchPresentationData, savePresentation, destroyPresentation} from "../demo-apis/slidecast-api";
import ControlSlideCast from '../slidecast-demo-components/ControlSlideCast';
import useStyles from './PresentSlidecast.style';


export default function PresentSlidecast() {
  const [ presoState, setPresoState ] = React.useState({ isLoading: true, isWorking: false });
  const assignPresoState = asStateAssigment(setPresoState);
  const { slidecastId, slides, title, nowShowing, isLoading, expiresAt, isWorking, xhrError } = presoState;

  React.useEffect(() => {
    isLoading && fetchPresentationData()
      .then(preso => assignPresoState({ isLoading: false, ...preso }))
      .catch(_xhrErrorHandler({ assignPresoState }));
    // eslint-disable-next-line
  }, [ isLoading ]);

  const classes = useStyles();
  let content;
  if (isLoading) {
    content = <div className={classes.isLoadingPreso}>
      <CircularProgress/>
      <p>Checking for existing SlideCast...</p>
    </div>
  } else if (xhrError) {
    content = <h3>Loading error: { xhrError.userMessage || 'Failed to reach server' }</h3>
  } else {
    const changeActiveSlide = (target) => {
      if (!Array.isArray(slides) || typeof nowShowing !== 'number') {
        return;
      }
      if (typeof target !== 'number' || target < -1 || target >= slides.length) {
        console.warn('changeActiveSlide received invalid value', target);
      } else {
        assignPresoState({ isWorking: true });
        displaySlide(target)
          .then(() => assignPresoState({ nowShowing: target }))
          .catch(_xhrErrorHandler({ assignPresoState }));
      }
    };

    const savePreso = ({ title, slides }) => {
      assignPresoState({ isWorking: true });
      return savePresentation({ title, slides })
        .then((data) => {
          const { slidecastId, expiresAt } = data;
          assignPresoState({
            title, slides,
            slidecastId, expiresAt,
            nowShowing: -1,
            isWorking: false,
            errors: null,
          });
        })
        .catch(_xhrErrorHandler({ assignPresoState }));
    };

    const destroyPreso = () => {
      assignPresoState({ isWorking: true });
      return destroyPresentation()
        .then(() => {
          assignPresoState({ isWorking: false, slidecastId: null, title: null, slides: null });
        })
        .catch(_xhrErrorHandler({ assignPresoState }));
    };
    
    const slideControlProps = {
      savePreso, destroyPreso, changeActiveSlide,
      slidecastId, slides, title, expiresAt, nowShowing,
    };
    content = <ControlSlideCast
      { ...slideControlProps }
    />;
  }

  // todo: isWorking; different from isLoading.. small, in corner, different color
  return <StandardLayout>
    {isWorking &&
    <div className={classes.isWorking}>
      <CircularProgress />
    </div>
    }
    { content }
  </StandardLayout>

}


function _xhrErrorHandler({ assignPresoState}) {
  return (err) => {
    console.error('PresentSlidecast XHR request failed:', err);
    assignPresoState({ isLoading: false, xhrError: err });
  }
}