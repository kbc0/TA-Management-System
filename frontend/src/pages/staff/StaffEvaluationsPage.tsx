import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Rating,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import GridItem from '../../components/common/GridItem';

interface Course {
  id: string;
  course_code: string;
  course_name: string;
}

interface TA {
  id: string;
  full_name: string;
  bilkent_id: string;
  email: string;
  profile_image?: string;
}

interface Evaluation {
  id: string;
  ta_id: string;
  ta_name: string;
  ta_bilkent_id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  semester: string;
  evaluator_id: string;
  evaluator_name: string;
  performance_rating: number;
  communication_rating: number;
  reliability_rating: number;
  knowledge_rating: number;
  overall_rating: number;
  strengths: string;
  areas_for_improvement: string;
  additional_comments: string;
  created_at: string;
  updated_at: string;
}

interface EvaluationFormData {
  ta_id: string;
  course_id: string;
  performance_rating: number;
  communication_rating: number;
  reliability_rating: number;
  knowledge_rating: number;
  strengths: string;
  areas_for_improvement: string;
  additional_comments: string;
}

const StaffEvaluationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tas, setTAs] = useState<TA[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [openEvaluationDialog, setOpenEvaluationDialog] = useState<boolean>(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<EvaluationFormData>({
    ta_id: '',
    course_id: '',
    performance_rating: 0,
    communication_rating: 0,
    reliability_rating: 0,
    knowledge_rating: 0,
    strengths: '',
    areas_for_improvement: '',
    additional_comments: '',
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Fetch evaluations and courses data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses first
        const coursesResponse = await api.get('/courses');
        
        // Check if response.data has a courses property
        const coursesFromResponse = coursesResponse.data.courses || coursesResponse.data;
        
        // Ensure courses is always an array
        const coursesData = Array.isArray(coursesFromResponse) ? coursesFromResponse : [];
        setCourses(coursesData);
        
        // If we have courses, set the first one as selected by default
        if (coursesData.length > 0) {
          setSelectedCourseId(coursesData[0].id);
          
          // Fetch TAs for the first course
          const tasResponse = await api.get(`/courses/${coursesData[0].id}/tas`);
          
          // Check if response.data has a tas property
          const tasFromResponse = tasResponse.data.tas || tasResponse.data;
          
          // Ensure TAs is always an array
          const tasData = Array.isArray(tasFromResponse) ? tasFromResponse : [];
          setTAs(tasData);
          
          // Fetch evaluations for the first course
          // Using the actual backend endpoint for evaluations
          const evaluationsResponse = await api.get(`/tasks/course/${coursesData[0].id}/evaluations`);
          
          // Check if response.data has an evaluations property
          const evaluationsFromResponse = evaluationsResponse.data.evaluations || evaluationsResponse.data;
          
          // Ensure evaluations is always an array
          const evaluationsData = Array.isArray(evaluationsFromResponse) ? evaluationsFromResponse : [];
          setEvaluations(evaluationsData);
        } else {
          setTAs([]);
          setEvaluations([]);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        // Set empty arrays on error
        setCourses([]);
        setTAs([]);
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle course change
  const handleCourseChange = async (courseId: string) => {
    try {
      setSelectedCourseId(courseId);
      setLoading(true);
      
      // Fetch TAs for the selected course
      const tasResponse = await api.get(`/courses/${courseId}/tas`);
      
      // Check if response.data has a tas property
      const tasFromResponse = tasResponse.data.tas || tasResponse.data;
      
      // Ensure TAs is always an array
      const tasData = Array.isArray(tasFromResponse) ? tasFromResponse : [];
      setTAs(tasData);
      
      // Fetch evaluations for the selected course
      // Using the actual backend endpoint for evaluations
      const evaluationsResponse = await api.get(`/tasks/course/${courseId}/evaluations`);
      
      // Check if response.data has an evaluations property
      const evaluationsFromResponse = evaluationsResponse.data.evaluations || evaluationsResponse.data;
      
      // Ensure evaluations is always an array
      const evaluationsData = Array.isArray(evaluationsFromResponse) ? evaluationsFromResponse : [];
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data. Please try again later.');
      // Set empty arrays on error
      setTAs([]);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  // Open evaluation dialog for creating a new evaluation
  const handleAddEvaluation = () => {
    setFormData({
      ta_id: '',
      course_id: selectedCourseId,
      performance_rating: 0,
      communication_rating: 0,
      reliability_rating: 0,
      knowledge_rating: 0,
      strengths: '',
      areas_for_improvement: '',
      additional_comments: '',
    });
    setFormErrors({});
    setEditingEvaluation(null);
    setOpenEvaluationDialog(true);
  };

  // Open evaluation dialog for editing an existing evaluation
  const handleEditEvaluation = (evaluation: Evaluation) => {
    setFormData({
      ta_id: evaluation.ta_id,
      course_id: evaluation.course_id,
      performance_rating: evaluation.performance_rating,
      communication_rating: evaluation.communication_rating,
      reliability_rating: evaluation.reliability_rating,
      knowledge_rating: evaluation.knowledge_rating,
      strengths: evaluation.strengths || '',
      areas_for_improvement: evaluation.areas_for_improvement || '',
      additional_comments: evaluation.additional_comments || '',
    });
    setFormErrors({});
    setEditingEvaluation(evaluation);
    setOpenEvaluationDialog(true);
  };

  // Handle form input changes for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      // Clear error for this field if it exists
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    }
  };

  // Handle select changes
  const handleSelectChange = (event: any) => {
    const name = event.target.name as string;
    const value = event.target.value;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      // Clear error for this field if it exists
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    }
  };

  // Handle rating changes
  const handleRatingChange = (name: string, value: number | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: value || 0,
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.ta_id) {
      errors.ta_id = 'Please select a TA';
    }
    
    if (!formData.course_id) {
      errors.course_id = 'Please select a course';
    }
    
    if (formData.performance_rating === 0) {
      errors.performance_rating = 'Performance rating is required';
    }
    
    if (formData.communication_rating === 0) {
      errors.communication_rating = 'Communication rating is required';
    }
    
    if (formData.reliability_rating === 0) {
      errors.reliability_rating = 'Reliability rating is required';
    }
    
    if (formData.knowledge_rating === 0) {
      errors.knowledge_rating = 'Knowledge rating is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate overall rating
  const calculateOverallRating = (): number => {
    const { performance_rating, communication_rating, reliability_rating, knowledge_rating } = formData;
    const sum = performance_rating + communication_rating + reliability_rating + knowledge_rating;
    return sum > 0 ? Math.round((sum / 4) * 10) / 10 : 0;
  };

  // Handle form submission
  const handleSubmitEvaluation = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const evaluationData = {
        ...formData,
        overall_rating: calculateOverallRating(),
      };
      
      if (editingEvaluation) {
        // Update existing evaluation
        // Using the actual backend endpoint for updating evaluations
        await api.put(`/tasks/evaluations/${editingEvaluation.id}`, evaluationData);
      } else {
        // Create new evaluation
        // Using the actual backend endpoint for creating evaluations
        await api.post(`/tasks/evaluations`, evaluationData);
      }
      
      // Refresh evaluations list
      // Use the correct API endpoint for fetching evaluations
      const evaluationsResponse = await api.get(`/courses/${selectedCourseId}/evaluations`);
      
      // Check if response.data has an evaluations property
      const evaluationsFromResponse = evaluationsResponse.data.evaluations || evaluationsResponse.data;
      
      // Ensure evaluations is always an array
      const evaluationsData = Array.isArray(evaluationsFromResponse) ? evaluationsFromResponse : [];
      setEvaluations(evaluationsData);
      
      // Close dialog
      setOpenEvaluationDialog(false);
    } catch (error) {
      console.error('Error saving evaluation:', error);
      setError('Failed to save evaluation. Please try again later.');
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (evaluationId: string) => {
    setEvaluationToDelete(evaluationId);
    setDeleteConfirmOpen(true);
  };

  // Handle evaluation deletion
  const handleDeleteEvaluation = async () => {
    if (!evaluationToDelete) return;
    
    try {
      setLoading(true);
      
      // Delete evaluation
      // Using the actual backend endpoint for deleting evaluations
      await api.delete(`/tasks/evaluations/${evaluationToDelete}`);
      
      // Refresh evaluations list
      // Using the actual backend endpoint for fetching evaluations
      const evaluationsResponse = await api.get(`/tasks/course/${selectedCourseId}/evaluations`);
      
      // Check if response.data has an evaluations property
      const evaluationsFromResponse = evaluationsResponse.data.evaluations || evaluationsResponse.data;
      
      // Ensure evaluations is always an array
      const evaluationsData = Array.isArray(evaluationsFromResponse) ? evaluationsFromResponse : [];
      setEvaluations(evaluationsData);
      
      // Close dialog
      setDeleteConfirmOpen(false);
      setEvaluationToDelete(null);
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      setError('Failed to delete evaluation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Show loading spinner while fetching data
  if (loading && courses.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if fetch failed
  if (error && courses.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">TA Evaluations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEvaluation}
        >
          Create Evaluation
        </Button>
      </Box>

      {/* Course selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Course
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="course-select-label">Course</InputLabel>
            <Select
              labelId="course-select-label"
              id="course-select"
              value={selectedCourseId}
              label="Course"
              onChange={(e) => handleCourseChange(e.target.value as string)}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.course_code}: {course.course_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Evaluations list */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Evaluations
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Box>
          ) : evaluations.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>TA</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Overall Rating</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>
                            {evaluation.ta_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">{evaluation.ta_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {evaluation.ta_bilkent_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">{evaluation.course_code}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {evaluation.semester}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating 
                            value={evaluation.overall_rating} 
                            precision={0.5} 
                            readOnly 
                            size="small" 
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {evaluation.overall_rating.toFixed(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatDate(evaluation.created_at)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Evaluation">
                          <IconButton size="small" onClick={() => handleEditEvaluation(evaluation)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Evaluation">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteClick(evaluation.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 4 }}>
              No evaluations found for this course. Create a new evaluation to get started.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Create/Edit Dialog */}
      <Dialog open={openEvaluationDialog} onClose={() => setOpenEvaluationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingEvaluation ? 'Edit Evaluation' : 'Create New Evaluation'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <GridItem xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.ta_id} required>
                <InputLabel id="ta-select-label">Teaching Assistant</InputLabel>
                <Select
                  labelId="ta-select-label"
                  id="ta-select"
                  name="ta_id"
                  value={formData.ta_id}
                  label="Teaching Assistant"
                  onChange={handleSelectChange}
                  disabled={!!editingEvaluation}
                >
                  {tas.map((ta) => (
                    <MenuItem key={ta.id} value={ta.id}>
                      {ta.full_name} ({ta.bilkent_id})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.ta_id && <FormHelperText>{formErrors.ta_id}</FormHelperText>}
              </FormControl>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.course_id} required>
                <InputLabel id="course-label">Course</InputLabel>
                <Select
                  labelId="course-label"
                  id="course"
                  name="course_id"
                  value={formData.course_id}
                  label="Course"
                  onChange={handleSelectChange}
                  disabled={!!editingEvaluation}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.course_code}: {course.course_name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.course_id && <FormHelperText>{formErrors.course_id}</FormHelperText>}
              </FormControl>
            </GridItem>
            
            <GridItem xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Performance Ratings
              </Typography>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Task Performance
                </Typography>
                <Rating
                  name="performance_rating"
                  value={formData.performance_rating}
                  onChange={(event, newValue) => handleRatingChange('performance_rating', newValue)}
                  size="large"
                />
                {formErrors.performance_rating && (
                  <FormHelperText error>{formErrors.performance_rating}</FormHelperText>
                )}
              </Box>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Communication Skills
                </Typography>
                <Rating
                  name="communication_rating"
                  value={formData.communication_rating}
                  onChange={(event, newValue) => handleRatingChange('communication_rating', newValue)}
                  size="large"
                />
                {formErrors.communication_rating && (
                  <FormHelperText error>{formErrors.communication_rating}</FormHelperText>
                )}
              </Box>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Reliability & Punctuality
                </Typography>
                <Rating
                  name="reliability_rating"
                  value={formData.reliability_rating}
                  onChange={(event, newValue) => handleRatingChange('reliability_rating', newValue)}
                  size="large"
                />
                {formErrors.reliability_rating && (
                  <FormHelperText error>{formErrors.reliability_rating}</FormHelperText>
                )}
              </Box>
            </GridItem>
            
            <GridItem xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Subject Knowledge
                </Typography>
                <Rating
                  name="knowledge_rating"
                  value={formData.knowledge_rating}
                  onChange={(event, newValue) => handleRatingChange('knowledge_rating', newValue)}
                  size="large"
                />
                {formErrors.knowledge_rating && (
                  <FormHelperText error>{formErrors.knowledge_rating}</FormHelperText>
                )}
              </Box>
            </GridItem>
            
            <GridItem xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  Overall Rating:
                </Typography>
                <Rating
                  value={calculateOverallRating()}
                  precision={0.5}
                  readOnly
                  size="large"
                />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {calculateOverallRating().toFixed(1)}
                </Typography>
              </Box>
            </GridItem>
            
            <GridItem xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Feedback
              </Typography>
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                name="strengths"
                label="Strengths"
                fullWidth
                multiline
                rows={3}
                value={formData.strengths}
                onChange={handleInputChange}
                placeholder="What are the TA's key strengths and positive contributions?"
              />
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                name="areas_for_improvement"
                label="Areas for Improvement"
                fullWidth
                multiline
                rows={3}
                value={formData.areas_for_improvement}
                onChange={handleInputChange}
                placeholder="What areas could the TA improve upon?"
              />
            </GridItem>
            
            <GridItem xs={12}>
              <TextField
                name="additional_comments"
                label="Additional Comments"
                fullWidth
                multiline
                rows={3}
                value={formData.additional_comments}
                onChange={handleInputChange}
                placeholder="Any other comments or feedback for the TA?"
              />
            </GridItem>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEvaluationDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitEvaluation} variant="contained">
            {editingEvaluation ? 'Update Evaluation' : 'Submit Evaluation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this evaluation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteEvaluation} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffEvaluationsPage;
