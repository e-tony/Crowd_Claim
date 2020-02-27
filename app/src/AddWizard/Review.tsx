import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Typography,
  makeStyles,
} from '@material-ui/core';

import { AppState, setUserEmail } from '../store';

const useStyles = makeStyles(theme => ({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export default function Review({ onBack, onComplete }: Props) {
  const dispatch = useDispatch();

  const userEmail = useSelector((state: AppState) => state.userEmail);
  const selectedCase = useSelector((state: AppState) => state.selectedCase);
  const classes = useStyles();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4" paragraph={true}>
        {selectedCase?.title}
      </Typography>
      <Typography component="h2" variant="h5">
        What's this about?
      </Typography>
      <Typography variant="body1" paragraph={true}>
        {selectedCase?.description}
      </Typography>
      <Typography component="h2" variant="h5">
        {selectedCase?.num_litigants} other{' '}
        {selectedCase?.num_litigants === 1 ? 'person has' : 'people have'}{' '}
        subscribed to this case.
      </Typography>
      <Typography variant="body1">
        You could be too! Click subscribe below to be notified if this case is
        ever picked up by a law firm.
      </Typography>
      <div className={classes.buttons}>
        <Button onClick={onBack} className={classes.button}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(true)}
          className={classes.button}
        >
          Subscribe
        </Button>
      </div>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this case, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            value={userEmail || ''}
            onChange={event => dispatch(setUserEmail(event.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={onComplete} color="primary">
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
