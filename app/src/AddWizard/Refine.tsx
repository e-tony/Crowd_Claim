import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonBase, makeStyles, Typography } from '@material-ui/core';
import ClimbingBoxLoader from 'react-spinners/ClimbingBoxLoader';

import { AppState, setSelectedCase, Case } from '../store';
import CaseCard from './CaseCard';

const useStyles = makeStyles(theme => ({
  caseButton: {
    borderRadius: 4,
    display: 'block',
    width: '100%',
    marginBottom: theme.spacing(3),
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

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export default function Refine({ onBack, onComplete }: Props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const relatedCases = useSelector((state: AppState) => state.relatedCases);
  const selectedCase = useSelector((state: AppState) => state.selectedCase);

  const handleClick = (c: Case) => {
    dispatch(setSelectedCase(c));
  };

  if (relatedCases === null) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <ClimbingBoxLoader color="#3f51b5" loading={true} />
      </div>
    );
  } else if (relatedCases.length === 0) {
    return <div>No related cases found. :(</div>;
  }

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4" paragraph={true}>
        Looks like other people are experiencing the same problem. We found{' '}
        {relatedCases.length} cases related to yours.
      </Typography>
      {relatedCases.map(c => (
        <ButtonBase
          key={c.rank}
          className={classes.caseButton}
          onClick={() => handleClick(c.case)}
        >
          <CaseCard {...c} selected={c.case === selectedCase} />
        </ButtonBase>
      ))}
      <div className={classes.buttons}>
        <Button onClick={onBack} className={classes.button}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onComplete}
          className={classes.button}
          disabled={selectedCase === null}
        >
          Next
        </Button>
      </div>
    </React.Fragment>
  );
}
