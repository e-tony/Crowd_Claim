import React from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import GroupIcon from '@material-ui/icons/Group';
import ReactMarkdown from 'react-markdown';

import { RelatedCasesResult } from '../client';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      display: 'flex',
    },
    content: {
      display: 'flex',
      flex: '1',
      flexDirection: 'column',
    },
    description: {
      display: 'block',
      textAlign: 'left',
      lineClamp: 5,
      boxOrient: 'vertical',
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headerItem: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
  })
);

type Props = RelatedCasesResult & { selected: boolean };

export default function CaseCard(props: Props) {
  const classes = useStyles();
  return (
    <Card
      key={props.rank}
      className={classes.root}
      style={props.selected ? { backgroundColor: 'lightgray' } : {}}
    >
      <CardContent className={classes.content}>
        <div className={classes.header}>
          <Typography component="h5" variant="h5">
            #{props.rank}) {props.case.title}
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            className={classes.headerItem}
          >
            {props.case.num_litigants}
            <GroupIcon />
          </Typography>
        </div>
        <Typography
          variant="body2"
          color="textSecondary"
          className={classes.description}
        >
          <ReactMarkdown source={props.entities.sentence} />
        </Typography>
      </CardContent>
    </Card>
  );
}
