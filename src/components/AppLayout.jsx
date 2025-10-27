"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '../app/utils/supabaseClient';
import Link from 'next/link';

export default function AppLayout({ children }) {
  // STATE (Global: Auth & Notifications)
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  // --- HANDLERS (Global) ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole('guest');
    window.location.href = '/login'; // Redirect to login on logout
  };

  // Notification Fetching Handler
  const fetchNotifications = async (currentSession) => {
    if (!currentSession) return;
    // 1. Get unread count
    const { count: unread } = await supabase
      .from('notifications').select('*', { count: 'exact', head: true })
      .eq('user_id', currentSession.user.id).eq('is_read', false);
    setUnreadCount(unread || 0);

    // 2. Get recent notifications list
    const { data: notificationsData } = await supabase
      .from('notifications').select('*')
      .eq('user_id', currentSession.user.id)
      .order('created_at', { ascending: false }).limit(20);
    setNotifications(notificationsData || []);
  };

  // Notification Click Handler
  const handleNotificationClick = async (notificationId, linkUrl) => {
  // --- Mark as read ---
  const notification = notifications.find(n => n.id === notificationId);
  const wasUnread = notification && !notification.is_read;
  let updateError = false;

  if (notificationId && wasUnread) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      updateError = true;
      alert('Failed to mark notification as read.');
    }
  }

  // --- Update local state ---
  if (notificationId && !updateError) {
    setNotifications(currentNotifications =>
      currentNotifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    if (wasUnread) {
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    }
  }

  // --- Close dropdown ---
  setIsNotificationDropdownOpen(false);

  // --- NEW Navigation Logic ---
  if (linkUrl) {
    if (linkUrl.startsWith('/')) {
      router.push(linkUrl); // Use Next.js router for internal links
    } else {
      window.location.href = linkUrl; // Fallback for external links
    }
  }
};

  // --- GLOBAL DATA FETCHING (Auth & Notifications)
    useEffect(() => {
    // Helper function to fetch user role and notifications
    const fetchUserData = async (currentSession) => {
      if (currentSession) {
        // Fetch Profile Role
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', currentSession.user.id).single();
        setUserRole(profile?.role || 'guest');
        // Fetch notifications
        await fetchNotifications(currentSession); // 
      } else {
        setUserRole('guest');
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUserData(session);
    });

    // 2. Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchUserData(session);
    });

    // 3. Cleanup the subscription when the component unmounts
    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  // --- RENDER ---
  return (
    <>
      <nav>
        <div className="nav-container">
          <div className="logo">
            <Link href="/" title="Go to Dashboard">IF/Platform</Link>
          </div>
          <ul className="nav-links">
            <li><Link href="/">Dashboard</Link></li>
            <li><Link href="/projects">Projects</Link></li>
            <li><Link href="/snippets">Snippets</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
          <div className="user-menu">
            <div
              className="notification-bell"
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-dot" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div 
              className="user-avatar" 
              onClick={() => session ? window.location.href = '/profile' : window.location.href = '/login'} 
              style={{ cursor: 'pointer' }}
              title={session ? 'Go to Profile' : 'Sign In'}
            >
              {session ? (userRole ? userRole.toUpperCase().charAt(0) : 'L') : 'S'}
            </div>
            <div 
              onClick={session ? handleLogout : () => window.location.href = '/login'} 
              style={{ cursor: 'pointer', paddingLeft: '1rem' }}
              title={session ? 'Log Out' : 'Sign In'}
            >
              {session ? 'LOG OUT' : 'SIGN IN'}
            </div>

            {/* Notification Dropdown */}
            {isNotificationDropdownOpen && (
              <div className="notification-dropdown" style={{ position: 'absolute', top: '60px', right: '20px', width: '300px', maxHeight: '400px', overflowY: 'auto', background: 'var(--dark)', border: '1px solid var(--grey-dark)', borderRadius: '4px', zIndex: 1000, color: 'var(--white)' }}>
                <h4 style={{ padding: '1rem', borderBottom: '1px solid var(--grey-dark)', margin: 0 }}>Notifications</h4>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      onClick={() => handleNotificationClick(notification.id, notification.link_url)}
                      style={{ padding: '1rem', borderBottom: '1px solid var(--grey-dark)', cursor: 'pointer', opacity: notification.is_read ? 0.6 : 1, background: notification.is_read ? 'transparent' : 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{notification.content}</p>
                      <small style={{ color: 'var(--grey-light)' }}>{new Date(notification.created_at).toLocaleDateString()}</small>
                    </div>
                  ))
                ) : (
                  <p style={{ padding: '1rem', textAlign: 'center' }}>No new notifications.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="main-container">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Main</div>
            <ul className="sidebar-menu">
              <li><Link href="/">📊 Dashboard</Link></li>
              <li><Link href="/projects">📁 Projects</Link></li>
              <li><Link href="/snippets">📝 Game Snippets</Link></li>
              <li><Link href="/blog">✍️ Blog Posts</Link></li>
              <li><Link href="/announcements">📢 Announcements</Link></li>
            </ul>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">Tools</div>
            <ul className="sidebar-menu">
              {userRole === 'admin' && (
                <>
                  <li><Link href="/analytics">📈 Analytics</Link></li>
                  <li><Link href="/file-manager">📤 File Manager</Link></li>
                </>
              )}
              {userRole !== 'guest' && (
                <li><Link href="/profile">👤 Profile</Link></li>
              )}
            </ul>
          </div>
        </aside>
        
        {/* THIS IS WHERE My PAGE WILL BE RENDERED */}
        <main className="content">
          {children}
        </main>

      </div>
    </>
  );
}