import React, { useState, useEffect } from 'react';

function CommentSection({ eventId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${eventId}`);
      const data = await response.json();
      setComments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment.');
      return;
    }
    if (!newComment.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId,
          comment: newComment
        })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to add comment');
        return;
      }

      setNewComment('');
      fetchComments();
    } catch (error) {
      alert('Error adding comment: ' + error.message);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete comment');
        return;
      }

      fetchComments();
    } catch (error) {
      alert('Error deleting comment: ' + error.message);
    }
  };

  if (loading) {
    return <div style={{ color: 'rgba(255,255,255,0.5)', padding: '20px', textAlign: 'center' }}>Loading comments...</div>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px' }}>
        💬 Comments ({comments.length})
      </h4>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              resize: 'vertical',
              minHeight: '60px',
              outline: 'none'
            }}
          />
          <div style={{ marginTop: '8px', textAlign: 'right' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '12px' }}
            >
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '20px' }}>
          Please <button 
            className="btn btn-outline" 
            style={{ padding: '4px 12px', fontSize: '12px' }}
            onClick={() => alert('Please login to comment.')}
          >
            login
          </button> to comment.
        </p>
      )}

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {comments.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '14px 18px',
              border: '1px solid rgba(255,255,255,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: '#c8a84e', fontSize: '13px', fontWeight: '600' }}>
                  {comment.username}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                {comment.comment}
              </p>
              {user && (user.id === comment.user_id || user.role === 'admin') && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  style={{
                    marginTop: '8px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    background: 'rgba(220,53,69,0.2)',
                    color: '#dc3545',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;