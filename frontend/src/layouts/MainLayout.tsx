import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  SwapHoriz as SwapHorizIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import NotificationBell from '../components/common/NotificationBell';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Drawer width
const drawerWidth = 240;

// Styled components
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

// Main layout component
const MainLayout: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  
  // Toggle drawer
  const toggleDrawer = () => {
    setOpen(!open);
  };
  
  // Handle profile menu open
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle profile menu close
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Profile navigation to handle user profile page
  const handleProfileNavigation = () => {
    handleProfileMenuClose();
    navigate(`/${authState.user?.role}/profile`);
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Handle profile click
  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate(`/${authState.user?.role}/profile`);
  };
  
  // Get navigation items based on user role
  const getNavigationItems = () => {
    const role = authState.user?.role;
    
    // Common navigation items for all roles
    const commonItems = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: `/${role}/dashboard`,
      },
      {
        text: 'Profile',
        icon: <PersonIcon />,
        path: `/${role}/profile`,
      },
    ];
    
    // TA-specific navigation items
    if (role === 'ta') {
      return [
        ...commonItems,
        {
          text: 'My Courses',
          icon: <SchoolIcon />,
          path: '/ta/courses',
        },
        {
          text: 'My Tasks',
          icon: <AssignmentIcon />,
          path: '/ta/tasks',
        },
        {
          text: 'Leave Requests',
          icon: <EventIcon />,
          path: '/ta/leaves',
        },
        {
          text: 'Swap Requests',
          icon: <SwapHorizIcon />,
          path: '/ta/swaps',
        },
      ];
    }
    
    // Staff-specific navigation items
    if (role === 'staff' || role === 'department_chair') {
      return [
        ...commonItems,
        {
          text: 'Courses',
          icon: <SchoolIcon />,
          path: '/staff/courses',
        },
        {
          text: 'Tasks',
          icon: <AssignmentIcon />,
          path: '/staff/tasks',
        },
        {
          text: 'Leave Requests',
          icon: <EventIcon />,
          path: '/staff/leaves',
        },
        {
          text: 'Swap Requests',
          icon: <SwapHorizIcon />,
          path: '/staff/swaps',
        },
        {
          text: 'Reports',
          icon: <AssignmentIcon />,
          path: '/staff/reports',
        },
      ];
    }
    
    // Admin-specific navigation items
    if (role === 'admin') {
      return [
        ...commonItems,
        {
          text: 'Users',
          icon: <PersonIcon />,
          path: '/admin/users',
        },
        {
          text: 'Courses',
          icon: <SchoolIcon />,
          path: '/admin/courses',
        },
        {
          text: 'Tasks',
          icon: <AssignmentIcon />,
          path: '/admin/tasks',
        },
        {
          text: 'Leave Requests',
          icon: <EventIcon />,
          path: '/admin/leaves',
        },
        {
          text: 'Swap Requests',
          icon: <SwapHorizIcon />,
          path: '/admin/swaps',
        },
        {
          text: 'Reports',
          icon: <AssignmentIcon />,
          path: '/admin/reports',
        },
        {
          text: 'Audit Logs',
          icon: <AssignmentIcon />,
          path: '/admin/audit-logs',
        },
        {
          text: 'Settings',
          icon: <SettingsIcon />,
          path: '/admin/settings',
        },
      ];
    }
    
    return commonItems;
  };
  
  // Navigation items based on user role
  const navigationItems = getNavigationItems();
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <StyledAppBar position="absolute" open={open}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            TA Management System
          </Typography>
          
          {/* Notifications Bell */}
          <NotificationBell />
          
          {/* Profile */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {authState.user?.full_name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </StyledAppBar>
      
      {/* Drawer */}
      <StyledDrawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        
        <Divider />
        
        {/* Navigation List */}
        <List component="nav">
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Logout */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </StyledDrawer>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        id="profile-menu"
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* No separate notifications menu needed as it's handled by NotificationBell component */}
    </Box>
  );
};

export default MainLayout;
