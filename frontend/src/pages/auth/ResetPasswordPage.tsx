import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
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
import authService from '../../services/authService';
import GridItem from '../../components/common/GridItem';

// Validation schema
const validationSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        if (!token) {
          setError('Invalid reset token. Please try again or request a new reset link.');
          return;
        }
        
        await authService.resetPassword(token, values.password);
        setSuccess(true);
        setError(null);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setError('Failed to reset password. The link may have expired or is invalid.');
        console.error('Password reset error:', error);
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
      
      {/* Right side - Reset password form */}
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
            Reset Password
          </Typography>
          
          {/* Success message */}
          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              Password reset successful! Redirecting to login page...
            </Alert>
          )}
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {/* Form */}
          {!success && (
            <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter your new password below.
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={formik.isSubmitting}
              >
                Reset Password
              </Button>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to Sign In
                </Link>
              </Box>
            </Box>
          )}
          
          <Box mt={5}>
            <Typography variant="body2" color="text.secondary" align="center">
              {'© '}
              {new Date().getFullYear()}{' '}
              TA Management System
            </Typography>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

export default ResetPasswordPage;
