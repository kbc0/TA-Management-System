import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import GridItem from '../../components/common/GridItem';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  // Navigation cards configuration
  const navCards = [
    {
      title: 'Courses',
      description: 'Manage courses, departments, and semesters',
      icon: <SchoolIcon fontSize="large" color="primary" />,
      path: '/admin/courses',
      color: '#e3f2fd',
    },
    {
      title: 'Users',
      description: 'Manage users, roles, and permissions',
      icon: <PeopleIcon fontSize="large" color="primary" />,
      path: '/admin/users',
      color: '#e8f5e9',
    },
    {
      title: 'Reports',
      description: 'View system reports and analytics',
      icon: <AssessmentIcon fontSize="large" color="primary" />,
      path: '/admin/reports',
      color: '#fff8e1',
    },
    {
      title: 'Audit Logs',
      description: 'Review system activity and audit logs',
      icon: <HistoryIcon fontSize="large" color="primary" />,
      path: '/admin/audit-logs',
      color: '#fce4ec',
    },
    {
      title: 'Settings',
      description: 'Configure system settings and preferences',
      icon: <SettingsIcon fontSize="large" color="primary" />,
      path: '/admin/settings',
      color: '#e0f7fa',
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Welcome Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <DashboardIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back, {authState.user?.full_name || 'Administrator'}! Here's your command center.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Navigation Cards */}
        <Grid container spacing={3}>
          {navCards.map((card) => (
            <GridItem xs={12} sm={6} md={4} key={card.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: card.color,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box sx={{ mb: 2 }}>{card.icon}</Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(card.path)}
                    sx={{ px: 4 }}
                  >
                    Go to {card.title}
                  </Button>
                </CardActions>
              </Card>
            </GridItem>
          ))}
        </Grid>



        
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;
