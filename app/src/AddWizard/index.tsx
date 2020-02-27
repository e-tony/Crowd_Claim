import React from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  makeStyles,
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Welcome from './Welcome';
import Refine from './Refine';
import Review from './Review';
import ThankYou from './ThankYou';
import Copyright from '../Copyright';
import { addSubscribedCase, setActiveStep, AppState } from '../store';
import { getRelatedCases } from '../store';

const useStyles = makeStyles(theme => ({
  layout: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  paper: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
    backgroundColor: 'transparent',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

const steps = ['Welcome', 'Cases', 'Review'];

export default function App() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const activeStep = useSelector((state: AppState) => state.activeStep);
  const selectedCase = useSelector((state: AppState) => state.selectedCase);
  const scenario = useSelector((state: AppState) => state.scenario);
  const history = useHistory();

  const handleNext = () => {
    dispatch(setActiveStep(activeStep + 1));
  };

  const handleBack = () => {
    dispatch(setActiveStep(activeStep - 1));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Welcome
            onComplete={() => {
              dispatch(getRelatedCases(scenario));
              handleNext();
            }}
          />
        );
      case 1:
        return <Refine onBack={handleBack} onComplete={handleNext} />;
      case 2:
        return (
          <Review
            onBack={handleBack}
            onComplete={() => {
              dispatch(addSubscribedCase(selectedCase));
              handleNext();
            }}
          />
        );
      case 3:
        return (
          <ThankYou
            onComplete={() => {
              dispatch(setActiveStep(0));
              history.push('/');
            }}
          />
        );
      default:
        throw new Error('Unknown step');
    }
  };

  return (
    <main className={classes.layout}>
      <Stepper activeStep={activeStep} className={classes.stepper}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Container>
        <Paper className={classes.paper}>{getStepContent(activeStep)}</Paper>
      </Container>
      <Copyright />
    </main>
  );
}
