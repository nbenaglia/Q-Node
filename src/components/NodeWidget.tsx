import * as React from 'react';
import { FC, createElement } from 'react';
import {
  Card,
  Box,
  Typography,
  Divider
} from '@mui/material';

interface Props {
  icon: FC<any>;
  title?: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
};

const NodeWidget = ({ icon, title, subtitle, children }: Props) => (
  <Card
    sx={{
      minHeight: 52,
      minWidth: '280px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      borderRadius: '10px'
    }}
  >
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '& .icon': {
          color: '#05a2e4',
        },
        '&:before': {
          position: 'absolute',
          top: '30%',
          left: -65,
          display: 'block',
          content: `''`,
          height: '200%',
          aspectRatio: '1',
          transform: 'translate(-30%, -60%)',
          borderRadius: '50%',
          backgroundColor: '#05a2e4',
          opacity: 0.15
        },
      }}
    >
      <Box
        width="5em"
        className="icon"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingRight: '48px',
          paddingBottom: '30px'
        }}
      >
        {createElement(icon, { fontSize: 'xlarge' })}
      </Box>
      <Box textAlign="right">
        <Typography
          color="textSecondary"
          sx={{ fontFamily: 'magistralbold' }}
        >
          {title}
        </Typography>
        <Typography variant="h5" component="h2">
          {subtitle || ' '}
        </Typography>
      </Box>
    </Box>
    {children && <Divider />}
    {children}
  </Card>
);

export default NodeWidget;