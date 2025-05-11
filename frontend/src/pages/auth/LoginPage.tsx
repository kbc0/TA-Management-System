import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  Alert,
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import GridItem from '../../components/common/GridItem';

// Validation schema
const validationSchema = yup.object({
  bilkent_id: yup
    .string()
    .required('Bilkent ID is required'),
  password: yup
    .string()
    .required('Password is required'),
});

const LoginPage: React.FC = () => {
  const { login, authState } = useAuth();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      bilkent_id: '',
      password: '',
      remember: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await login({ bilkent_id: values.bilkent_id, password: values.password });
        
        // Navigate based on user role
        if (authState.user) {
          switch (authState.user.role) {
            case 'ta':
              navigate('/ta/dashboard');
              break;
            case 'staff':
            case 'department_chair':
              navigate('/staff/dashboard');
              break;
            case 'admin':
              navigate('/admin/dashboard');
              break;
            default:
              navigate('/');
          }
        }
      } catch (error) {
        setShowError(true);
        console.error('Login error:', error);
      }
    },
  });

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Left side - Image */}
      <Box
        sx={{
          flexGrow: 0,
          flexBasis: { xs: 0, sm: '33.333%', md: '58.333%' },
          backgroundImage: 'url(https://source.unsplash.com/random?university)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Right side - Login form */}
      <Box
        component={Paper}
        elevation={6}
        square
        sx={{
          flexGrow: 0,
          flexBasis: { xs: '100%', sm: '66.666%', md: '41.666%' },
        }}
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          
          <Typography component="h1" variant="h5">
            TA Management System
          </Typography>
          
          <Typography component="h2" variant="h6" sx={{ mt: 1 }}>
            Sign in
          </Typography>
          
          {/* Error alert */}
          {showError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              Invalid Bilkent ID or password. Please try again.
            </Alert>
          )}
          
          {/* Login form */}
          <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="bilkent_id"
              label="Bilkent ID"
              name="bilkent_id"
              autoComplete="username"
              autoFocus
              value={formik.values.bilkent_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.bilkent_id && Boolean(formik.errors.bilkent_id)}
              helperText={formik.touched.bilkent_id && formik.errors.bilkent_id}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  name="remember"
                  color="primary"
                  checked={formik.values.remember}
                  onChange={formik.handleChange}
                />
              }
              label="Remember me"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={formik.isSubmitting}
            >
              Sign In
            </Button>
            
            <Grid container>
              <GridItem xs>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </GridItem>
            </Grid>
            
            <Box mt={5}>
              <Typography variant="body2" color="text.secondary" align="center">
                {'© '}
                {new Date().getFullYear()}{' '}
                TA Management System
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

export default LoginPage;
