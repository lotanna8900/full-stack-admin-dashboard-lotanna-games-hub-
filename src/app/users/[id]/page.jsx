"use client";
import { useState, useEffect, use } from 'react'; 
import { supabase } from '../../utils/supabaseClient'; 
import Link from 'next/link';
import Image from 'next/image'; 

export default function UserProfilePage({ params: paramsProp }) { 
  const params = use(paramsProp); 
  const { id } = params; 

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return; 
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('user_profiles_public') 
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id]); 

  if (loading) {
    return <div className="section"><div className="dashboard-header"><h1>Loading Profile...</h1></div></div>;
  }

  if (!userProfile) {
    return <div className="section"><div className="dashboard-header"><h1>Profile not found.</h1></div></div>;
  }

  return (
    <div className="section">
      {/* 5. AVATAR LOGIC */}
      <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {userProfile.avatar_url ? (
          <Image
            src={userProfile.avatar_url}
            alt={userProfile.username || 'User avatar'}
            width={100}
            height={100}
            style={{ borderRadius: '50%', border: '2px solid var(--grey-dark)' }}
            priority 
          />
        ) : (
          <div 
            className="user-avatar-placeholder" 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%',
              backgroundColor: 'var(--grey-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'var(--white)'
            }}
          >
            {/* Show first letter of username, or '?' */}
            <span>{userProfile.username ? userProfile.username.charAt(0).toUpperCase() : '?'}</span>
          </div>
        )}
        
        <div className="dashboard-title">
          <h1>{userProfile.username || 'Anonymous User'}</h1>
          <p className="dashboard-subtitle">
            Member since {userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2 className="content-title">About</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {userProfile.bio || 'No bio provided.'}
          </p>
        </div>
      </div>
    </div>
  );
}