import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';

import { AppState, setScenario } from '../store';

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

export default function AddressForm({ onComplete }: Props) {
  const dispatch = useDispatch();
  const scenario = useSelector((state: AppState) => state.scenario);
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4" align="center" paragraph={true}>
        <WbSunnyIcon />
        &nbsp; Welcome!
      </Typography>
      <TextField
        id="scenario"
        name="scenario"
        label="What has you concerned today?"
        fullWidth
        multiline
        rows={4}
        rowsMax={8}
        helperText="We'll use this information to match you with relevant cases. Please include as much specific information as possible."
        variant="outlined"
        onChange={v => dispatch(setScenario(v.target.value))}
        value={scenario}
      />
      <div className={classes.buttons}>
        <Button
          variant="contained"
          color="primary"
          onClick={onComplete}
          className={classes.button}
          disabled={scenario.length === 0}
        >
          Next
        </Button>
      </div>
    </React.Fragment>
  );
}
