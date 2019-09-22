import React from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import { Button, IconButton, Paper } from '@material-ui/core';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';

import SlideMarkdown, {IconType} from "./SlideMarkdown";
import EditSlideCast from './EditSlideCast';
import useStyles from './ControlSlideCast.style';
import {addKeyBindings, removeKeyBindings} from "../util/key-binding-util";
import {ButtonWithConfirmationModal} from "../components/confirmation-components";



export default function ControlSlideCast(props) {
  const { savePreso, destroyPreso, changeActiveSlide,
    slidecastId, slides, title, expiresAt, nowShowing } = props;

  const [ isEditing, setIsEditing ] = React.useState(false);
  const [ scrollToSlide, setScrollToSlide ] = React.useState(nowShowing);
  const watchUrl = `${global.location.origin}/app/slides/${slidecastId}`; // todo: how to get this from the router?
  const expirationDate = expiresAt && new Date(expiresAt);

  const slideRefsByNdx = [];
  const updateSlideRef = (ndx, ref) => {
    slideRefsByNdx[ndx] = ref;
  };
  
  React.useLayoutEffect(() => {
    if (typeof scrollToSlide === 'number' && Array.isArray(slides)) {
      const el = ReactDOM.findDOMNode(slideRefsByNdx[scrollToSlide]);
      setScrollToSlide(false);
      if (el && el.scrollIntoView && !_isFullyVisible(el)) {
        el.scrollIntoView(); // note: behavior isn't always nice (like when partially visible.) If for a real project, look into higher-level libs
      }
    }
  }, [ nowShowing, slides, scrollToSlide, slideRefsByNdx ]);


  const gotoSlide = ({ incr, target }) => {
    if (incr) {
      target = nowShowing + incr;
    }
    if (target < -1) {
      target = -1;
    } else if (target >= slides.length) {
      target = slides.length - 1;
    }
    changeActiveSlide(target);
    setScrollToSlide(target);
  };

  const keyBindings = {
    'right': () => gotoSlide({ incr: +1 }),
    'down': () => gotoSlide({ incr: +1 }),
    'left': () => gotoSlide({ incr: -1 }),
    'up': () => gotoSlide({ incr: -1 }),
    'home': () => gotoSlide({ target: 0 }),
    'end': () => gotoSlide({ target: (slides || []).length ? slides.length - 1 : -1 }),
  };

  React.useEffect(() => {
    if (isEditing) {
      removeKeyBindings(keyBindings);
    } else {
      addKeyBindings(keyBindings);
    }
    return () => {
      removeKeyBindings(keyBindings)
    }
  }, [ slides, nowShowing, isEditing, keyBindings ]);


  const hasSlides = !!(slides && slides.length);
  if (!hasSlides && !isEditing) {
    setIsEditing(true);
  }
  const editorProps = {
    closeEditor: () => setIsEditing(false),
    slides, title, savePreso,
    canCancel: hasSlides,
  };

  const renderDeleteButton = (props) => <Button
      { ...props }
      className={classes.deleteButton}
      variant="outlined"
      size="small"
      color="secondary"
    >Delete</Button>;

  const classes = useStyles();

  return <>
    { isEditing &&
    <EditSlideCast
      { ...editorProps }
    /> }

    <h2>
      { slidecastId ? title : 'Slides not yet added' }


      {slidecastId &&
      <>
        <Button
          onClick={() => setIsEditing(true)}
          className={classes.editButton}
          variant="contained"
          size="small"
          color="primary"
        >
          {slidecastId ? 'Edit' : 'Create SlideCast'}
        </Button>

        <ButtonWithConfirmationModal
          button={ renderDeleteButton }
          onConfirm={destroyPreso}
          content="This will delete all of your slides and cannot be undone."
        />
      </>}
    </h2>
    <Paper className={classes.watchSlidecastArea}>
      <h4>Watch SlideCast at:</h4>
      <a href={watchUrl} target="_blank" rel="noopener noreferrer">{ watchUrl }</a>
    </Paper>

    {expirationDate &&
    <p>NOTE: slide data will be deleted on {expirationDate.toLocaleDateString()} at {expirationDate.toLocaleTimeString() }.
    </p>
    }


    <SlideListArea
      slides={slides}
      nowShowing={nowShowing}
      classes={classes}
      gotoSlide={gotoSlide}
      updateSlideRef={updateSlideRef}
    />
  </>
}

function SlideListArea({ slides, classes, nowShowing, gotoSlide, updateSlideRef }) {
  if (!slides || !slides.length) {
    return null;
  }
  const slideCount = slides.length;

  const renderSlideItem = ({ markdown, iconType, ndx}) => {
    let caption;
    if (ndx === nowShowing) {
      caption = ndx < 0 ? 'Showing "Not In Session" Slide' : `Now Showing #${ndx + 1}`;
    } else if (ndx < 0) {
      caption = 'Not In Session';
    } else {
      caption = `Slide ${ndx + 1} of ${slideCount}`;
    }

    const renderAdvanceSlideControl = ({ ndx, dir }) => {
      if ((dir < 0 && ndx === -1) || (dir > 0 && ndx + 1 === slideCount)) {
        return <span className={ classes.noSlideControl }></span>;
      }

      return <span className={ classes.advanceSlideControl}>
        <IconButton
          onClick={() => gotoSlide({ incr: dir }) }
          aria-label={ dir > 0 ? 'next' : 'previous'}>
          { dir > 0 ? <SkipNextIcon /> : <SkipPreviousIcon /> }
        </IconButton>
      </span>
    };
    const isNowShowing = nowShowing === ndx;
    return <div
      className={clsx(classes.slideRow, 'slide-row')}
      key={ndx}
      ref={ (r) => updateSlideRef(ndx, r) }
    >
      { isNowShowing && renderAdvanceSlideControl({ ndx, dir: -1 })}
      <span
        className={classes.slideHolder}
        onClick={() => gotoSlide({ target: ndx })}
      >
        <SlideMarkdown
          className={ [ classes.slideCardThumb, ...(isNowShowing ? [ classes.nowShowing, 'now-showing' ] : []) ]}
          markdown={markdown}
          iconType={iconType}
          iconProps={{ style: { fontSize: '14vh', margin: '3vh 0' } }}
        />
        <p className={classes.slideNdxBlurb}>{ caption }</p>
      </span>
      { isNowShowing && renderAdvanceSlideControl({ ndx, dir: +1 })}
    </div>
  };

  return <div className={classes.previewArea}>
    <div className={classes.slideList}>
      { renderSlideItem({ iconType: IconType.NoContent, ndx: -1 }) }
      { slides.map((markdown, ndx) => renderSlideItem({ markdown, ndx })) }
    </div>
  </div>
}


function _isFullyVisible(el) {
  const { top, bottom } = el.getBoundingClientRect();
  return top >= 0 && bottom <= window.innerHeight;
}
