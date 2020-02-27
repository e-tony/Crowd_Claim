import React from 'react';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  copyright: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export default function Copyright() {
  const classes = useStyles();

  return (
    <div className={classes.copyright}>
      <Typography variant="body2" color="textSecondary" align="center">
        {'© '}
        <Link color="inherit" href="https://solutions.law/">
          solutions.law
        </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    </div>
  );
}
