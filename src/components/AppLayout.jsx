"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../app/utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

export default function AppLayout({ children }) {
  // STATE
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Refs for click-outside detection
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // --- CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- SCROLL LOCK EFFECT ---
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]); 

  // --- CLOSE MOBILE MENU ON ROUTE CHANGE ---
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // --- HANDLERS ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole('guest');
    setUsername('');
    setAvatarUrl('');
    router.push('/login');
  };

  // Notification Fetching Handler
  const fetchNotifications = async (currentSession) => {
    if (!currentSession) return;
    
    const { count: unread } = await supabase
      .from('notifications').select('*', { count: 'exact', head: true })
      .eq('user_id', currentSession.user.id).eq('is_read', false);
    setUnreadCount(unread || 0);

    const { data: notificationsData } = await supabase
      .from('notifications').select('*')
      .eq('user_id', currentSession.user.id)
      .order('created_at', { ascending: false }).limit(20);
    setNotifications(notificationsData || []);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!session || unreadCount === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  // Notification Click Handler
  const handleNotificationClick = async (notificationId, linkUrl) => {
    const notification = notifications.find(n => n.id === notificationId);
    const wasUnread = notification && !notification.is_read;

    if (notificationId && wasUnread) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (!error) {
        setNotifications(currentNotifications =>
          currentNotifications.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
    }

    setIsNotificationDropdownOpen(false);

    if (linkUrl) {
      if (linkUrl.startsWith('/')) {
        router.push(linkUrl);
      } else {
        window.location.href = linkUrl;
      }
    }
  };

  // --- GLOBAL DATA FETCHING ---
  useEffect(() => {
    const fetchUserData = async (currentSession) => {
      if (currentSession) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, username, avatar_url')
          .eq('id', currentSession.user.id)
          .single();
        
        setUserRole(profile?.role || 'guest');
        setUsername(profile?.username || 'User');
        setAvatarUrl(profile?.avatar_url || '');
        
        await fetchNotifications(currentSession);
      } else {
        setUserRole('guest');
        setUsername('Guest');
        setAvatarUrl('');
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUserData(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchUserData(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Helper to check if route is active
  const isActive = (path) => pathname === path;

  // Get relative time for notifications
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // --- RENDER ---
  return (
    <>
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="top-nav">
        <div className="nav-container">
          
          {/* Hamburger Menu */}
          <button
            className="hamburger-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Logo */}
          <div className="logo">
            <Link href="/" title="Go to Dashboard">
              <Image
                src="/logo.png" 
                alt="Lota Labs Logo"
                width={100}   
                height={35}  
                priority
                style={{ height: 'auto', width: 'auto' }} 
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li className={isActive('/') ? 'active' : ''}>
              <Link href="/">Dashboard</Link>
            </li>
            <li className={isActive('/projects') ? 'active' : ''}>
              <Link href="/projects">Projects</Link>
            </li>
            <li className={isActive('/snippets') ? 'active' : ''}>
              <Link href="/snippets">Snippets</Link>
            </li>
            <li className={isActive('/blog') ? 'active' : ''}>
              <Link href="/blog">Blog</Link>
            </li>
          </ul>

          {/* User Menu */}
          <div className="user-menu">
            {/* Notification Bell */}
            <div className="notification-wrapper" ref={notificationRef}>
              <button
                className="notification-bell"
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                aria-label="Notifications"
              >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationDropdownOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <button 
                        className="btn-link-small" 
                        onClick={handleMarkAllAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                          onClick={() => handleNotificationClick(notification.id, notification.link_url)}
                        >
                          <div className="notification-content">
                            <p>{notification.content}</p>
                            <small>{getRelativeTime(notification.created_at)}</small>
                          </div>
                          {!notification.is_read && <span className="unread-dot"></span>}
                        </div>
                      ))
                    ) : (
                      <div className="notification-empty">
                        <span className="empty-icon">📭</span>
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar & Dropdown */}
            <div className="user-dropdown-wrapper" ref={userMenuRef}>
              <button
                className="user-avatar-button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User menu"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={username}
                    width={36}
                    height={36}
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {session ? username.charAt(0).toUpperCase() : 'G'}
                  </div>
                )}
                <span className="user-name-desktop">{username}</span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="user-dropdown-menu">
                  {session ? (
                    <>
                      <div className="user-dropdown-header">
                        <p className="user-dropdown-name">{username}</p>
                        <p className="user-dropdown-role">{userRole}</p>
                      </div>
                      <div className="user-dropdown-divider"></div>
                      <Link href="/profile" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                        <span>👤</span> Profile Settings
                      </Link>
                      <div className="user-dropdown-divider"></div>
                      <button className="user-dropdown-item logout" onClick={handleLogout}>
                        <span>🚪</span> Log Out
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                      <span>🔐</span> Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <aside className="sidebar mobile-sidebar">
            <div className="mobile-sidebar-header">
              <h3>Menu</h3>
              <button 
                className="mobile-menu-close" 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* User Info in Mobile Menu */}
            {session && (
              <div className="mobile-user-info">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={username}
                    width={50}
                    height={50}
                    className="mobile-user-avatar"
                  />
                ) : (
                  <div className="mobile-user-avatar-placeholder">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="mobile-user-name">{username}</p>
                  <p className="mobile-user-role">{userRole}</p>
                </div>
              </div>
            )}

            <div className="sidebar-section">
              <div className="sidebar-title">Main</div>
              <ul className="sidebar-menu">
                <li className={isActive('/') ? 'active' : ''}>
                  <Link href="/">📊 Dashboard</Link>
                </li>
                <li className={isActive('/projects') ? 'active' : ''}>
                  <Link href="/projects">📁 Projects</Link>
                </li>
                <li className={isActive('/snippets') ? 'active' : ''}>
                  <Link href="/snippets">🎮 Game Snippets</Link>
                </li>
                <li className={isActive('/blog') ? 'active' : ''}>
                  <Link href="/blog">✍️ Blog Posts</Link>
                </li>
                <li className={isActive('/announcements') ? 'active' : ''}>
                  <Link href="/announcements">📢 Announcements</Link>
                </li>
              </ul>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-title">Tools</div>
              <ul className="sidebar-menu">
                {userRole === 'admin' && (
                  <>
                    <li className={isActive('/analytics') ? 'active' : ''}>
                      <Link href="/analytics">📈 Analytics</Link>
                    </li>
                    <li className={isActive('/file-manager') ? 'active' : ''}>
                      <Link href="/file-manager">📤 File Manager</Link>
                    </li>
                    <li className={isActive('/reports') ? 'active' : ''}>
                      <Link href="/reports">🚩 Reports</Link>
                    </li>
                  </>
                )}
                {userRole !== 'guest' && (
                  <li className={isActive('/profile') ? 'active' : ''}>
                    <Link href="/profile">👤 Profile</Link>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="main-container">
        {/* Desktop Sidebar */}
        <aside className="sidebar desktop-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Main</div>
            <ul className="sidebar-menu">
              <li className={isActive('/') ? 'active' : ''}>
                <Link href="/">📊 Dashboard</Link>
              </li>
              <li className={isActive('/projects') ? 'active' : ''}>
                <Link href="/projects">📁 Projects</Link>
              </li>
              <li className={isActive('/snippets') ? 'active' : ''}>
                <Link href="/snippets">🎮 Game Snippets</Link>
              </li>
              <li className={isActive('/blog') ? 'active' : ''}>
                <Link href="/blog">✍️ Blog Posts</Link>
              </li>
              <li className={isActive('/announcements') ? 'active' : ''}>
                <Link href="/announcements">📢 Announcements</Link>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Tools</div>
            <ul className="sidebar-menu">
              {userRole === 'admin' && (
                <>
                  <li className={isActive('/analytics') ? 'active' : ''}>
                    <Link href="/analytics">📈 Analytics</Link>
                  </li>
                  <li className={isActive('/file-manager') ? 'active' : ''}>
                    <Link href="/file-manager">📤 File Manager</Link>
                  </li>
                  <li className={isActive('/reports') ? 'active' : ''}>
                    <Link href="/reports">🚩 Reports</Link>
                  </li>
                </>
              )}
              {userRole !== 'guest' && (
                <li className={isActive('/profile') ? 'active' : ''}>
                  <Link href="/profile">👤 Profile</Link>
                </li>
              )}
            </ul>
          </div>
        </aside>
        
        <main className="content">
          {children}
        </main>
      </div>
    </>
  );
}