import React, { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

interface GridItemProps {
  children: ReactNode;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  sx?: SxProps<Theme>;
}

/**
 * A component that replaces the Grid item functionality from Material-UI
 * 
 * This component uses Box with flexbox properties to achieve the same layout
 * as Grid items, avoiding TypeScript errors with the Grid component.
 */
const GridItem: React.FC<GridItemProps> = (props) => {
  const { children, xs, sm, md, lg, xl, sx = {} } = props;
  
  // Convert grid sizes to flex basis percentages
  const getFlexBasis = (size: number | boolean | undefined) => {
    if (size === undefined) return undefined;
    if (size === true) return 0; // auto
    if (size === false) return undefined;
    // Convert grid units (1-12) to percentages
    return `${(size / 12) * 100}%`;
  };
  
  return (
    <Box
      sx={{
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: getFlexBasis(xs),
        '@media (min-width: 600px)': {
          flexBasis: getFlexBasis(sm),
        },
        '@media (min-width: 900px)': {
          flexBasis: getFlexBasis(md),
        },
        '@media (min-width: 1200px)': {
          flexBasis: getFlexBasis(lg),
        },
        '@media (min-width: 1536px)': {
          flexBasis: getFlexBasis(xl),
        },
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default GridItem;
