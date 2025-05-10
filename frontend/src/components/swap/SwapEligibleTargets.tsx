// src/components/swap/SwapEligibleTargets.tsx
import React, { useState, useEffect } from 'react';
import { EligibleSwapTarget } from '../../api/swaps';
import './SwapEligibleTargets.css';

interface EligibleTA {
  id: number;
  full_name: string;
  bilkent_id: string;
  email: string;
}

interface SwapEligibleTargetsProps {
  assignmentId: number;
  assignmentType: 'task' | 'exam';
  onSelectTarget: (targetId: number) => void;
  onCancel: () => void;
}

const SwapEligibleTargets: React.FC<SwapEligibleTargetsProps> = ({
  assignmentId,
  assignmentType,
  onSelectTarget,
  onCancel
}) => {
  const [eligibleTAs, setEligibleTAs] = useState<EligibleTA[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTA, setSelectedTA] = useState<number | null>(null);
  const [assignmentDetails, setAssignmentDetails] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchEligibleTargets = async () => {
      try {
        // Import the API functions dynamically to avoid circular dependencies
        const { getEligibleSwapTargets } = await import('../../api/swaps');
        const { getTaskById } = await import('../../api/tasks');
        
        // Fetch eligible targets using the API service
        const eligibleTargets = await getEligibleSwapTargets(assignmentId, assignmentType);
        
        if (isMounted) {
          // Transform the data to match our component's expected format
          const formattedTAs: EligibleTA[] = eligibleTargets.map(target => ({
            id: target.id,
            full_name: target.fullName,
            bilkent_id: target.bilkentId || '',
            email: target.email || ''
          }));
          
          setEligibleTAs(formattedTAs);
        }
        
        // Fetch assignment details
        if (assignmentType === 'task') {
          try {
            const taskDetails = await getTaskById(assignmentId);
            if (isMounted) {
              setAssignmentDetails(taskDetails);
            }
          } catch (detailsError) {
            console.error('Error fetching task details:', detailsError);
          }
        } else {
          // For exam type, we would need to implement the exam API service
          console.log('Exam details fetching not yet implemented');
        }
        
        if (isMounted) {
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching eligible targets:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load eligible targets');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEligibleTargets();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [assignmentId, assignmentType]);

  const handleSelect = (taId: number) => {
    setSelectedTA(taId);
  };

  const handleConfirm = () => {
    if (selectedTA) {
      onSelectTarget(selectedTA);
    }
  };

  // Generate deterministic progress values based on TA ID
  const generateWorkloadPercentage = (taId: number) => {
    // Use a deterministic algorithm based on the ID
    return ((taId * 17) % 60) + 40; // Values between 40-99%
  };

  const filteredTAs = eligibleTAs.filter(ta => 
    ta.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ta.bilkent_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading eligible TAs...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="swap-modal-overlay">
      <div className="swap-modal">
        <div className="swap-modal-header">
          <h2>Select TA for Swap</h2>
          <button
            className="close-button"
            onClick={onCancel}
          >
            &times;
          </button>
        </div>
        
        <div className="swap-modal-body">
          {assignmentDetails && (
            <div className="assignment-details">
              <h3>Assignment Details</h3>
              <div className="details-grid">
                <div>
                  <p><strong>Assignment:</strong> {assignmentType === 'task' ? assignmentDetails.title : assignmentDetails.exam_name}</p>
                  <p><strong>Course:</strong> {assignmentDetails.course_id}</p>
                </div>
                <div>
                  <p><strong>Date:</strong> {new Date(assignmentType === 'task' ? assignmentDetails.due_date : assignmentDetails.exam_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {assignmentType === 'task' ? 'N/A' : `${assignmentDetails.start_time} - ${assignmentDetails.end_time}`}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="search-area">
            <label>Search TA</label>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="ta-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Workload</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTAs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="no-results">No eligible TAs found</td>
                  </tr>
                ) : (
                  filteredTAs.map((ta) => {
                    const workloadPercentage = generateWorkloadPercentage(ta.id);
                    
                    return (
                      <tr 
                        key={ta.id} 
                        className={selectedTA === ta.id ? 'selected-row' : ''}
                        onClick={() => handleSelect(ta.id)}
                      >
                        <td>{ta.full_name}</td>
                        <td>{ta.bilkent_id}</td>
                        <td>
                          <div className="workload-bar">
                            <div 
                              className="workload-progress" 
                              style={{ width: `${workloadPercentage}%` }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <span className="status-available">Available</span>
                        </td>
                        <td>
                          <button 
                            className="select-button"
                            onClick={() => handleSelect(ta.id)}
                          >
                            {selectedTA === ta.id ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="swap-options">
            <label className="option-label">
              <input type="checkbox" className="swap-checkbox" />
              <span>Open to any task swap</span>
            </label>
            <p className="option-description">
              Both parties need to agree to the swap. Prefer swaps at specific times.
            </p>
          </div>
        </div>
        
        <div className="swap-modal-footer">
          <button 
            className="cancel-button" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="confirm-button" 
            onClick={handleConfirm}
            disabled={!selectedTA}
          >
            Send Swap Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapEligibleTargets;