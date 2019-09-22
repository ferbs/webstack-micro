import React from 'react';
import { Link as NavLink } from '@reach/router';
import { Grid, Card, CardContent, Typography } from '@material-ui/core';
import RouterIcon from '@material-ui/icons/Router';
import TelegramIcon from '@material-ui/icons/Telegram';
import useStyles from './demo-nav-cards.style';

export function MainNavCardList() {
  const classes = useStyles();
  return <Grid
    container
    className={classes.navCardList}
    spacing={3}
  >
    <Grid item xs={12} sm={6} className={classes.mainGridItem}>
      <NavCard
        title="Background Push Demo"
        navTo="/app/background_push"
        renderIcon={ (props) => <TelegramIcon { ...props } /> }
        description="A dry but informative example of pushing background worker results over WebSockets."
      />
    </Grid>
    <Grid item xs={12} sm={6} className={classes.mainGridItem}>
      <NavCard
        title="Real-time SlideCast Demo"
        navTo="/app/slidecast/present"
        renderIcon={ (props) => <RouterIcon { ...props } /> }
        description="Once the real-time plumbing is in place, it's tempting to add fun features."
      />
    </Grid>
  </Grid>
}

export function NavCard({ navTo, title, renderIcon, description }) {
  const classes = useStyles();

  return <NavLink to={navTo}>
    <Card className={ classes.demoCard }>
      <CardContent className={classes.cardContent}>
        <div className={classes.iconCol}>
          { renderIcon({ className: classes.icon }) }
        </div>
        <div className={classes.mainCol}>
          <Typography component="h2" variant="h2" gutterBottom>
            { title }
          </Typography>
          <Typography
            className={classes.description}
            component="p"
            variant="body1"
          >
            { description }
          </Typography>
        </div>
      </CardContent>
    </Card>
  </NavLink>
}
