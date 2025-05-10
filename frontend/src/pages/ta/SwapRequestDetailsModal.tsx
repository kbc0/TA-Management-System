import React from "react";
import "./SwapRequestDetailsModal.css";
import { SwapRequest as ApiSwapRequest } from "../../api/swaps";

// Extended interface for the UI with additional properties
interface SwapRequest extends ApiSwapRequest {
  title: string;
  yourTask: {
    course: string;
    task: string;
    date: string;
    time: string;
    location: string;
  };
  proposedTask: {
    course: string;
    task: string;
    date: string;
    time: string;
  };
  reason: string;
  timeline: {
    sent: string;
    taResponse: string;
    instructorApproval: string;
  };
}

interface SwapRequestDetailsModalProps {
  show: boolean;
  request: SwapRequest | null;
  onClose: () => void;
  onCancelRequest: (id: number) => void;
}

const SwapRequestDetailsModal: React.FC<SwapRequestDetailsModalProps> = ({
  show,
  request,
  onClose,
  onCancelRequest,
}) => {
  if (!show || !request) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Swap Request Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <h5 className="mb-3">{request.title}</h5>

            <div className="d-flex gap-3">
              {/* Your Task */}
              <div className="task-box">
                <h6 className="task-header">Your Task</h6>
                <p>
                  <strong>Course:</strong> {request.yourTask.course}
                </p>
                <p>
                  <strong>Task:</strong> {request.yourTask.task}
                </p>
                <p>
                  <strong>Date:</strong> {request.yourTask.date}
                </p>
                <p>
                  <strong>Time:</strong> {request.yourTask.time}
                </p>
                <p>
                  <strong>Location:</strong> {request.yourTask.location}
                </p>
              </div>

              {/* Proposed Swap */}
              <div className="task-box">
                <h6 className="task-header">Proposed Swap</h6>
                <p>
                  <strong>Course:</strong> {request.proposedTask.course}
                </p>
                <p>
                  <strong>Task:</strong> {request.proposedTask.task}
                </p>
                <p>
                  <strong>Date:</strong> {request.proposedTask.date}
                </p>
                <p>
                  <strong>Time:</strong> {request.proposedTask.time}
                </p>
              </div>
            </div>

            {/* Reason for Swap */}
            <div className="mt-3">
              <h6>Reason for Swap</h6>
              <p>{request.reason || "N/A"}</p>
            </div>

            {/* Request Timeline */}
            <div className="mt-3">
              <h6>Request Timeline</h6>
              <ul className="timeline">
                <li>
                  <strong>📨 Sent:</strong> {request.timeline.sent}
                </li>
                <li>
                  <strong>🕒 TA Response:</strong> {request.timeline.taResponse}
                </li>
                <li>
                  <strong>✅ Instructor Approval:</strong>{" "}
                  {request.timeline.instructorApproval}
                </li>
              </ul>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-danger"
              onClick={() => onCancelRequest(request.id)}
            >
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapRequestDetailsModal;
