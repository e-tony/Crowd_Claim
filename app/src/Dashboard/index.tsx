import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  AppBar,
  Container,
  makeStyles,
  Typography,
  Toolbar,
  Button,
  Grid,
  Paper,
  IconButton,
} from '@material-ui/core';
import { deepOrange } from '@material-ui/core/colors';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AddIcon from '@material-ui/icons/Add';
import PeopleIcon from '@material-ui/icons/People';
import ShareIcon from '@material-ui/icons/Share';
import { useSelector } from 'react-redux';

import { AppState, Case } from '../store';
import Copyright from '../Copyright';

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: 'calc(64px + 16px)',
    height: 'calc(100vh - (64px + 16px))',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  menuTitle: {
    flexGrow: 1,
  },
  caseListing: {
    width: '100%',
    marginBottom: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseListingDetails: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  caseListingActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatar: {
    backgroundColor: deepOrange[500],
  },
}));

interface Props {
  case: Case;
}

function CaseListing(props: Props) {
  const classes = useStyles();

  return (
    <Paper className={classes.caseListing}>
      <div className={classes.caseListingDetails}>
        <AssignmentIcon />
        &nbsp;
        <Typography>{props.case.title}</Typography>
      </div>
      <div className={classes.caseListingActions}>
        <div className={classes.caseListingActions}>
          <PeopleIcon />
          &nbsp;
          <Typography>{props.case.num_litigants}</Typography>
        </div>
        <div>
          <IconButton>
            <ShareIcon />
          </IconButton>
        </div>
      </div>
    </Paper>
  );
}

export default function Dashboard() {
  const classes = useStyles();
  const subscribedCases = useSelector(
    (state: AppState) => state.subscribedCases
  );

  return (
    <main>
      <AppBar position="absolute">
        <Toolbar>
          <EmojiPeopleIcon className={classes.menuButton} />
          <Typography component="h1" className={classes.menuTitle}>
            CrowdClaim
          </Typography>
          <Button
            component={RouterLink}
            style={{ color: 'white' }}
            to="/add"
            startIcon={<AddIcon />}
          >
            Add Case
          </Button>
          <Avatar className={classes.avatar}>M</Avatar>
        </Toolbar>
      </AppBar>
      <Container className={classes.content}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography component="h1" variant="h4" paragraph={true}>
              Hi! Here are your subscribed cases:
            </Typography>
          </Grid>
          {subscribedCases.map(c => (
            <CaseListing key={c.title} case={c} />
          ))}
        </Grid>
        <Copyright />
      </Container>
    </main>
  );
}
