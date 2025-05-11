import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  bilkent_id: yup
    .string()
    .required('Bilkent ID is required'),
});

const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      bilkent_id: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await authService.requestPasswordReset(values.bilkent_id);
        setSubmitted(true);
        setError(null);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to send password reset request. Please try again.');
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
      
      {/* Right side - Forgot password form */}
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
            Forgot Password
          </Typography>
          
          {/* Success message */}
          {submitted && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              Password reset request sent. Please check with your administrator.
            </Alert>
          )}
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {/* Form */}
          {!submitted ? (
            <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter your Bilkent ID and we'll process your password reset request.
              </Typography>
              
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
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={formik.isSubmitting}
              >
                Send Reset Link
              </Button>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to Sign In
                </Link>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                sx={{ mt: 1 }}
              >
                Back to Sign In
              </Button>
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

export default ForgotPasswordPage;
