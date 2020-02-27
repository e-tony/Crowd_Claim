import React from 'react';
import { Button, Typography, makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';

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
  onComplete: () => void;
}

export default function ThankYou({ onComplete }: Props) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography variant="h5" gutterBottom>
        Thank you for subscribing.
      </Typography>
      <Typography variant="subtitle1">
        You will be notified if this case is ever acted on by a law firm.
      </Typography>
      <div className={classes.buttons}>
        <Button
          variant="contained"
          color="primary"
          onClick={onComplete}
          className={classes.button}
          startIcon={<HomeIcon />}
        >
          Home
        </Button>
      </div>
    </React.Fragment>
  );
}
