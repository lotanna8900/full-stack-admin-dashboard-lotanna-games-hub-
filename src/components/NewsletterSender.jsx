"use client";
import { useState } from 'react';
import { supabase } from '../app/utils/supabaseClient'; 
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
  () => import('./RichTextEditor'), 
  { 
    ssr: false, 
    loading: () => (
      <textarea 
        className="form-textarea" 
        style={{ minHeight: '200px' }} 
        disabled 
        value="Loading editor..." 
      />
    )
  }
);

export default function NewsletterSender() {
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSendNewsletter = async (event) => {
    event.preventDefault();
    
    if (!subject || !htmlContent || htmlContent === '<p></p>') {
      setMessage({ type: 'error', text: 'Please fill out all fields.' });
      return;
    }

    setIsSending(true);
    setMessage(null);

    const { data, error } = await supabase.functions.invoke(
      'send-newsletter', 
      {
        body: { 
          subject: subject, 
          html_content: htmlContent 
        }
      }
    );

    // Keep the 'isSending' state true here so the button stays disabled
    // setIsSending(false); 

    if (error) {
      console.error('Error sending newsletter:', error);
      setMessage({ type: 'error', text: `Failed to send: ${error.message}` });
      setIsSending(false); // Re-enable the button on error
    } else {
      console.log('Newsletter function response:', data);
      setMessage({ type: 'success', text: data.message || 'Newsletter sent successfully! Reloading...' });
      
      // Clear the form state
      setSubject('');
      setHtmlContent(''); 

      // After 2 seconds, reload the page to clear the editor
      // The button will stay disabled during this time.
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="content-card" style={{ marginBottom: '1.5rem' }}>
      <h2 className="content-title">🧪 Send "The Lab Report"</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        This will send an email to all users who have opted-in to the newsletter.
      </p>

      <form onSubmit={handleSendNewsletter}>
        
        <div className="form-group">
          <label className="form-label" htmlFor="newsletter-subject">Subject</label>
          <input
            id="newsletter-subject"
            type="text"
            className="form-input"
            placeholder="e.g., The Lab Report #1: Our Newest Project"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Content (Email Body)</label>
          <RichTextEditor
            initialContent={htmlContent}
            onUpdate={(newContent) => {
              setHtmlContent(newContent);
            }}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSending}
          style={{ marginTop: '0.5rem' }}
        >
          {isSending ? 'Sending...' : 'Send Newsletter'}
        </button>

        {message && (
          <p style={{ 
            color: message.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            marginTop: '1rem',
            fontWeight: '600'
          }}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}