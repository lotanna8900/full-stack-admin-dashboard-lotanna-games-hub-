"use client";
import { useState } from 'react';
import { supabase } from '../app/utils/supabaseClient';

export default function ReportCommentButton({ commentId, session }) {
  const [isReporting, setIsReporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const reportReasons = [
    'Spam or misleading',
    'Harassment or hate speech',
    'Violence or threats',
    'Inappropriate content',
    'Other'
  ];

  const handleReport = async (e) => {
    e.preventDefault();
    if (!session || !selectedReason) return;

    setIsReporting(true);

    const reportText = selectedReason === 'Other' ? reason : selectedReason;

    const { error } = await supabase
      .from('reports')
      .insert({
        comment_id: commentId,
        reporter_id: session.user.id,
        reason: reportText
      });

    if (error) {
      console.error('Error reporting comment:', error);
      alert('Failed to report comment. Please try again.');
    } else {
      alert('Thank you for your report. We will review it shortly.');
      setShowModal(false);
      setReason('');
      setSelectedReason('');
    }

    setIsReporting(false);
  };

  if (!session) return null;

  return (
    <>
      <button 
        className="btn-link" 
        onClick={() => setShowModal(true)}
        style={{ color: 'var(--text-secondary)' }}
      >
        🚩 Report
      </button>

      {showModal && (
        <div className="modal active">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Report Comment</h2>
              <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
            </div>
            
            <form onSubmit={handleReport}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Help us understand what's wrong with this comment.
              </p>

              <div className="form-group">
                <label className="form-label">Reason for report *</label>
                {reportReasons.map((reasonOption) => (
                  <label key={reasonOption} style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="reason"
                      value={reasonOption}
                      checked={selectedReason === reasonOption}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {reasonOption}
                  </label>
                ))}
              </div>

              {selectedReason === 'Other' && (
                <div className="form-group">
                  <label className="form-label">Please specify</label>
                  <textarea
                    className="form-textarea"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the issue..."
                    required
                    style={{ minHeight: '100px' }}
                  ></textarea>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isReporting || !selectedReason}
                >
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowModal(false)}
                  disabled={isReporting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}