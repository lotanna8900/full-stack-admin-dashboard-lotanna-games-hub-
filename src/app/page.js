"use client";
import {useState, useEffect} from "react";
import { supabase } from './utils/supabaseClient';
import ReactMarkdown from 'react-markdown';

export default function HomePage() {
    // state for navigation and modals
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isNewPostModalOpen, setNewPostModalOpen] = useState(false);
    const [isNewProjectModalOpen, setNewProjectModalOpen] = useState(false);

    // state for data
    const [projects, setProjects] = useState([]);
    const [posts, setPosts] = useState([]);
    const [snippets, setSnippets] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);

    // state for authentication and user role
    const [session, setSession] = useState(null); // The user's session data
    const [userRole, setUserRole] = useState(null); // Will be 'admin' or 'user'
    const [loadingSession, setLoadingSession] = useState(true); // To prevent content flash

    // State for the profile form
    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');

    // State for file uploads (for future use)
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    //state for new project form inputs
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    //state for new post form inputs
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');

    // State for the edit functionality
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isEditSnippetModalOpen, setIsEditSnippetModalOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState(null);
    const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');

    // State for new comment input
    const [newCommentContent, setNewCommentContent] = useState('');

    // New state to manage which comment's reply box is open
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);

    // State for the new snippet modal
    const [isNewSnippetModalOpen, setIsNewSnippetModalOpen] = useState(false);
    const [newSnippetTitle, setNewSnippetTitle] = useState('');
    const [newSnippetDescription, setNewSnippetDescription] = useState('');
    const [newSnippetGameUrl, setNewSnippetGameUrl] = useState('');
    const [newSnippetImageUrl, setNewSnippetImageUrl] = useState('');

    // State for the new announcement modal
    const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false);
    const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
    const [newAnnouncementContent, setNewAnnouncementContent] = useState('');

    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

    //fetch project data initially
    useEffect(() => {
    const getProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) console.error('Error fetching projects:', error);
      else if (data) setProjects(data);
    };
    getProjects();
  }, []);
    
    // handlers
    const showSection = (sectionName) => {
        setActiveSection(sectionName);
    };

    // modal handlers
    const openNewPostModal = () => {
        setNewPostModalOpen(true);
    };
    const closeNewPostModal = () => {
        setNewPostModalOpen(false);
    };

    const openNewProjectModal = () => setNewProjectModalOpen(true);
    const closeNewProjectModal = () => {
    setNewProjectModalOpen(false);
    // Clear form fields when the form closes
    setNewProjectName('');
    setNewProjectDescription('');
  };

    //Form submission handler
    const handleCreateProject = async (event) => {
    event.preventDefault(); // Prevent page reload

    if (!newProjectName.trim()) {
      alert('Project name cannot be empty.');
      return;
    }

    // Insert the new project into the Supabase 'projects' table
    const { data, error } = await supabase
      .from('projects')
      .insert([{ title: newProjectName, description: newProjectDescription }])
      .select() // returns the newly created row, very important stuff
      .single(); // We only expect one row back

    if (error) {
      console.error('Error creating project:', error);
      alert('Could not create the project.');
    } else if (data) {
      // Add the new project to local state so that the UI is updated instantly
      setProjects([data, ...projects]);
      closeNewProjectModal();
    }
  };

    
    // Delete Handler
    //Delete Project
    const handleDeleteProject = async (projectId) => {
    // 1. Confirm deletion with the user for safety
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return; // Stop if the user cancels
    }

    // 2. Execute the DELETE query on Supabase
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      alert('Could not delete the project.');
    } else {
      // 3. Update the local state to remove the project instantly
      setProjects(projects.filter(project => project.id !== projectId));
    }
  };

    // Delete Post
    const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      alert('Could not delete the post.');
    } else {
      setPosts(posts.filter(p => p.id !== postId));
    }
  };

    // Delete Comment
    const handleDeleteComment = async (commentId) => {
      if (!window.confirm("Are you sure you want to delete your comment?")) return;

      const { error } = await supabase.from('comments').delete().eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        alert('Could not delete comment.');
      } else {
        // Remove the comment from the local state
        setPosts(posts.map(post => ({
          ...post,
          comments: post.comments.filter(c => c.id !== commentId)
        })));
      }
    };


    // Modal Handlers for Edit
    // Open Edit Project Modal and populate fields
    const openEditProjectModal = (project) => {
        setEditingProject(project);// Set the project being edited
        setNewProjectName(project.title); // Use existing data on the form to populate the fields
        setNewProjectDescription(project.description);
        setIsEditProjectModalOpen(true);
    };

    const closeEditProjectModal = () => {
        setIsEditProjectModalOpen(false);
        setEditingProject(null);// Clear the editing project
        setNewProjectName('');
        setNewProjectDescription('');
    };

    // Open Edit Post Modal and populate fields
    const openEditSnippetModal = (snippet) => {
      setEditingSnippet(snippet);
      setNewSnippetTitle(snippet.title);
      setNewSnippetDescription(snippet.description || '');
      setNewSnippetGameUrl(snippet.game_url);
      setNewSnippetImageUrl(snippet.image_url || '');
      setIsEditSnippetModalOpen(true);
    };

    const closeEditSnippetModal = () => {
      setIsEditSnippetModalOpen(false);
      setEditingSnippet(null);
      // Clear form fields
      setNewSnippetTitle('');
      setNewSnippetDescription('');
      setNewSnippetGameUrl('');
      setNewSnippetImageUrl('');
    };

    // Open Edit Post Modal and populate fields
    const openEditPostModal = (post) => {
      setEditingPost(post);
      setNewPostTitle(post.title);
      setNewPostContent(post.content);
      setIsEditPostModalOpen(true);
    };

    const closeEditPostModal = () => {
      setIsEditPostModalOpen(false);
      setEditingPost(null);
      setNewPostTitle('');
      setNewPostContent('');
    };



    // Update submission handler
    // Update Project
    const handleUpdateProject = async (event) => {
        event.preventDefault();

        if (!editingProject) return; // Safety check

        const projectId = editingProject.id;

        //send the updated data to supabase
        const { data, error } = await supabase
            .from('projects')
            .update({ title: newProjectName, description: newProjectDescription }) // Data to use and update the project
            .eq('id', projectId) // Important: Only update the row where the 'id' matches
            .select() 
            .single();

        if (error) {
            console.error('Error updating project:', error);
            alert('Could not update the project.');
        }   else if (data) {
            // Update the local state so that changes will reflect instantly
            setProjects(projects.map(p =>
                p.id === projectId ? data : p // Replace the old project data with the updated one
            ));

            // Close the modal
            closeEditProjectModal();
        }
    };

    // Update Post
    const handleUpdatePost = async (event) => {
      event.preventDefault();
      if (!editingPost) return;

      const { data, error } = await supabase
        .from('posts')
        .update({ title: newPostTitle, content: newPostContent })
        .eq('id', editingPost.id)
        .select('*, comments(*, author:profiles(username))')
        .single();

      if (error) {
        console.error('Error updating post:', error);
        alert('Could not update the post.');
      } else {
        setPosts(posts.map(p => (p.id === editingPost.id ? data : p)));
        closeEditPostModal();
      }
    };


    // Update Comment
    const handleUpdateComment = async (event, commentId) => {
      event.preventDefault();
      
      const { data, error } = await supabase
        .from('comments')
        .update({ content: editingCommentContent })
        .eq('id', commentId)
        .select('*, author:profiles(username)')
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        alert('Could not update comment.');
      } else {
        // Update the specific comment in the local state
        setPosts(posts.map(post => ({
          ...post,
          comments: post.comments.map(c => (c.id === commentId ? data : c))
        })));
        // Close the edit form
        setEditingCommentId(null);
        setEditingCommentContent('');
      }
    };


    // handleCreatePost
    const handleCreatePost = async (event) => {
      event.preventDefault();

      // Safety check: Ensure a user is logged in
      if (!session) {
        alert('You must be logged in to create a post.');
        return;
      }

      // Get the logged-in user's ID
      const authorId = session.user.id;

      // Insert the new post into the 'posts' table
      const { data, error } = await supabase
        .from('posts')
        .insert([{ 
          title: newPostTitle, 
          content: newPostContent, 
          author_id: authorId 
        }])
        .select('*, comments(*)')
        .single();

      if (error) {
        console.error('Error creating post:', error);
        alert('Could not create the post. Check the console for details.');
      } else if (data) {
        // Add the new post to the local state to update the UI
        setPosts([data, ...posts]);
        
        // Reset form and close modal
        setNewPostTitle('');
        setNewPostContent('');
        closeNewPostModal();
      }
    };

    // Handle creating a comment
    const handleCreateComment = async (event, postId, parentId = null) => {
      event.preventDefault();

      if (!session) {
        alert('You must be logged in to comment.');
        return;
      }
      if (!newCommentContent.trim()) {
        return; // Don't submit empty comments
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([{
          content: newCommentContent,
          post_id: postId,
          author_id: session.user.id,
          parent_id: parentId // This will be null for top-level comments, or an ID for replies
        }])
        .select('*, author:profiles(username)') // Fetch the profile with the new comment
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        alert('Could not post comment.');
      } else if (data) {
        setPosts(posts.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) }
            : post
        ));
        setNewCommentContent(''); // Reset the input field
        setReplyingToCommentId(null); // Close the reply box
      }
    };

        // New: Log Out Handler
        const handleLogout = async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) {
                setSession(null);
                setUserRole('guest');
                window.location.href = '/';
            }
        };

    
      // New: Pin/Unpin Handler for Admins
      const handlePinComment = async (commentId, currentStatus) => {
        // 1. Send the update request to Supabase to toggle the 'is_pinned' status
        const { data: updatedComment, error } = await supabase
          .from('comments')
          .update({ is_pinned: !currentStatus })
          .eq('id', commentId)
          .select('*, author:profiles(username)')
          .single();

        if (error) {
          console.error('Error pinning comment:', error);
          alert('Could not update the comment.');
        } else if (updatedComment) {
          // 2. Update the local state to reflect the change instantly
          setPosts(posts.map(post => {
            // Find the post that contains the comment we just updated
            const commentExistsInPost = post.comments.some(c => c.id === commentId);
            if (!commentExistsInPost) return post;

            // If found, update that specific comment in the post's comments array
            return {
              ...post,
              comments: post.comments.map(comment => 
                comment.id === commentId ? updatedComment : comment
              )
            };
          }));
        }
      };
      
      
      // New: Pin/Unpin Handler for Posts
      const handlePinPost = async (postId, currentStatus) => {
        const { data: updatedPost, error } = await supabase
          .from('posts')
          .update({ is_pinned: !currentStatus })
          .eq('id', postId)
          .select('*, comments(*, author:profiles(username))') 
          .single();

        if (error) {
          console.error('Error pinning post:', error);
          alert('Could not update the post.');
        } else if (updatedPost) {
          // Replace the old post with the updated one in our local state
          setPosts(posts.map(p => (p.id === postId ? updatedPost : p)));
        }
      };


      // New: Pin/Unpin Handler for Projects
      const handlePinProject = async (projectId, currentStatus) => {
        const { data: updatedProject, error } = await supabase
          .from('projects')
          .update({ is_pinned: !currentStatus })
          .eq('id', projectId)
          .select()
          .single();

        if (error) {
          console.error('Error pinning project:', error);
          alert('Could not update the project.');
        } else if (updatedProject) {
          setProjects(projects.map(p => (p.id === projectId ? updatedProject : p)));
        }
      };



    // Profile Update Handler
    const handleUpdateProfile = async (event) => {
      event.preventDefault();

      if (!session) {
        alert("You must be logged in to update your profile.");
        return;
      }

      const user = session.user;
      
      // Prepare the data for upsert
      const profileData = {
        id: user.id, // The user's ID
        username: username,
        bio: bio,
        updated_at: new Date(), 
      };

      // Perform the 'upsert' operation
      const { error } = await supabase.from('profiles').upsert(profileData);

      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile.');
      } else {
        // Update the local state to reflect the change immediately
        setProfile(profile); 
        alert('Profile updated successfully!');
      }
    };


    // Snippet Modal Handlers
    const openNewSnippetModal = () => setIsNewSnippetModalOpen(true);

    const closeNewSnippetModal = () => {
      setIsNewSnippetModalOpen(false);
      // Reset form fields
      setNewSnippetTitle('');
      setNewSnippetDescription('');
      setNewSnippetGameUrl('');
      setNewSnippetImageUrl('');
    };

    // Form Submission Handler for Snippets
    const handleCreateSnippet = async (event) => {
      event.preventDefault();
      if (!session) return;

      const { data, error } = await supabase
        .from('snippets')
        .insert([{
          title: newSnippetTitle,
          description: newSnippetDescription,
          game_url: newSnippetGameUrl,
          image_url: newSnippetImageUrl,
          author_id: session.user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating snippet:', error);
        alert('Could not create the snippet.');
      } else {
        // Add the new snippet to the local state for an instant UI update
        setSnippets([data, ...snippets]);
        closeNewSnippetModal();
      }
    };


    // --- Snippet Handler Functions ---
    const handleDeleteSnippet = async (snippetId) => {
      if (!window.confirm("Are you sure you want to delete this snippet?")) {
        return;
      }

      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', snippetId);

      if (error) {
        console.error('Error deleting snippet:', error);
        alert('Could not delete the snippet.');
      } else {
        setSnippets(snippets.filter(snippet => snippet.id !== snippetId));
      }
    };

    const handleUpdateSnippet = async (event) => {
      event.preventDefault();
      if (!editingSnippet) return;

      const { data, error } = await supabase
        .from('snippets')
        .update({ 
          title: newSnippetTitle, 
          description: newSnippetDescription,
          game_url: newSnippetGameUrl,
          image_url: newSnippetImageUrl
        })
        .eq('id', editingSnippet.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating snippet:', error);
        alert('Could not update the snippet.');
      } else {
        setSnippets(snippets.map(s => (s.id === editingSnippet.id ? data : s)));
        closeEditSnippetModal();
      }
    };



    // --- Storage Handler Functions ---
    const BUCKET_NAME = 'admin-assets'; 

    // 1. Fetch the list of files
    const fetchFiles = async () => {
      if (userRole !== 'admin') return;

      const { data, error } = await supabase.storage.from(BUCKET_NAME).list();

      if (error) {
        console.error('Error listing files:', error);
      } else if (data) {
        // Sort by most recently updated
        data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setFiles(data);
      }
    };

    // File Fetching Effect
    useEffect(() => {
      // 1. I want this to only run this if the user is authenticated as an admin
      if (userRole === 'admin') {
        // 2. I now know the role, so I can safely fetch the files!
        fetchFiles();
      }
      // 3. The effect runs whenever the userRole changes
    }, [userRole]); // Dependency array includes userRole

    // 2. Handle the file upload
    const handleFileUpload = async (e) => {
      e.preventDefault();
      if (!selectedFile) return;

      setUploading(true);
      
      const file = selectedFile;
      const filePath = `${Date.now()}_${file.name.replace(/\s/g, '_')}`; // Ensure unique path

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      setUploading(false);

      if (error) {
        console.error('Error uploading file:', error); //
        alert('File upload failed. Check the browser console for details.'); // <-- This one will hlep me MAKE SURE alert IS PRESENT
      } else {
        alert('File uploaded successfully!');
        setSelectedFile(null);
        e.target.reset();
        fetchFiles();
      }
    };

    // 3. Handle file deletion
    const handleDeleteFile = async (fileName) => {
      if (!window.confirm(`Are you sure you want to delete the file: ${fileName}?`)) return;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        console.error('Error deleting file:', error);
        alert('File deletion failed.');
      } else {
        alert('File deleted successfully.');
        fetchFiles(); // Refresh the file list
      }
    };

    // 4. Function to get a signed URL (allows me temporary public access for viewing/downloading)
    const getPublicUrl = async (fileName) => {
      // Supabase RLS policies will allow only the admin will successfully get the URL
      const { data } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(fileName, 60); // URL expires in 60 seconds

      return data?.signedUrl;
    };



    // Announcement Modal Handlers 

    const openNewAnnouncementModal = () => setIsNewAnnouncementModalOpen(true);

    const closeNewAnnouncementModal = () => {
      setIsNewAnnouncementModalOpen(false);
      // Reset form fields
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
    };

    // Form Submission Handler for Announcements

    const handleCreateAnnouncement = async (event) => {
      event.preventDefault();
      if (!session) return;

      const { data, error } = await supabase
        .from('announcements')
        .insert([{
          title: newAnnouncementTitle,
          content: newAnnouncementContent,
          author_id: session.user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating announcement:', error);
        alert('Failed to create announcement.');
      } else {
        // This is add my new announcement to the top of the list for an instant UI update
        setAnnouncements([data, ...announcements]);
        closeNewAnnouncementModal();
      }
    };



    // Notification Fetching Handler
    const fetchNotifications = async () => {
      if (!session) return; // Only run if logged in

      // 1. Get the count of specifically UNREAD notifications for the badge
      const { count: unread, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true }) // head:true makes it faster
        .eq('user_id', session.user.id)
        .eq('is_read', false); // Count only unread

      if (countError) {
        console.error("Error fetching unread count:", countError);
        setUnreadCount(0); // Default to 0 on error
      } else {
        setUnreadCount(unread || 0); // Set the count for the bell
      }

      // 2. Get the list of ALL recent notifications (read and unread) for the dropdown
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id) // Only for the current user
        // NO filter for is_read here
        .order('created_at', { ascending: false }) // Newest first
        .limit(20); // Fetch recent history (e.g., last 20)

      if (error) {
        console.error('Error fetching notifications list:', error);
        setNotifications([]); // Default to empty list on error
      } else {
        setNotifications(data || []); // Set the list for the dropdown
      }
    };


    // Notification Click Handler
    const handleNotificationClick = async (notificationId, linkUrl) => {
      // --- Mark as read ---
      const notification = notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.is_read;
      let updateError = false;

      if (wasUnread) {
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
      if (!updateError) {
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

      // --- Navigation Logic ---
      if (linkUrl) {
        const urlParts = linkUrl.split('?');
        const path = urlParts[0];
        const params = new URLSearchParams(urlParts[1] || '');

        // Handle Blog Post/Reply Links
        if (path === '/blog') {
          const postId = params.get('post');
          const replyId = params.get('reply');
          
          showSection('blog'); // Switch view

          setTimeout(() => {
            // Scroll to reply if specified, otherwise scroll to post
            const targetId = replyId || postId; 
            const targetSelector = replyId ? `[data-comment-id="${targetId}"]` : `[data-post-id="${postId}"]`; // Need to add data-post-id to post card
            
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Optional highlight
              targetElement.style.transition = 'background-color 0.5s ease';
              targetElement.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
              setTimeout(() => { targetElement.style.backgroundColor = ''; }, 2000);
            } else {
              console.warn(`Could not find element with selector: ${targetSelector}`);
            }
          }, 100);
        } 
        // Handle Announcements Link
        else if (path === '/announcements') {
          const announcementId = params.get('id');
          console.log('Attempting to navigate to announcement:', announcementId);

          showSection('announcements');

          setTimeout(() => {
            const targetSelector = `[data-announcement-id="${announcementId}"]`;
            console.log('Searching for selector:', targetSelector);
            const targetElement = document.querySelector(targetSelector);

            if (targetElement) {
              console.log('Element found! Scrolling...');
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              targetElement.style.transition = 'background-color 0.5s ease';
              targetElement.style.backgroundColor = 'rgba(255, 255, 0, 0.2)'; // Yellow highlight
              setTimeout(() => {
                  targetElement.style.backgroundColor = ''; // Remove highlight after 2 seconds
              }, 2000);
            } else {
              console.error(`ERROR: Element not found for selector: ${targetSelector}`);
            }
          }, 100);
        }
        // Handle Projects Link
        else if (path === '/projects') {
            const projectId = params.get('project'); // Get the project ID
            
            showSection('projects'); // Switch view

            // Add scrolling logic
            setTimeout(() => {
                const targetSelector = `[data-project-id="${projectId}"]`; // Selector using the data attribute
                const targetElement = document.querySelector(targetSelector);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Optional highlight
                    targetElement.style.transition = 'background-color 0.5s ease';
                    targetElement.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                    setTimeout(() => { targetElement.style.backgroundColor = ''; }, 2000);
                } else {
                    console.warn(`Could not find element with selector: ${targetSelector}`);
                }
            }, 100);
        }
        // Fallback for external links
        else {
          window.location.href = linkUrl;
        }
      }
    };



    // Subscription Handlers 

    const handleSubscribe = async (contentType, contentId) => {
      if (!session) return;

      // Determine which column to set based on content type
      const insertData = { user_id: session.user.id };
      if (contentType === 'post') {
        insertData.post_id = contentId;
      } else if (contentType === 'project') {
        insertData.project_id = contentId;
      } else {
        return; // Invalid type
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(insertData)
        .select('post_id, project_id') // Select the key columns
        .single();

      if (error) {
        console.error(`Error subscribing to ${contentType}:`, error);
        alert(`Failed to subscribe.`);
      } else if (data) {
        // Add the new subscription to local state
        setSubscriptions([...subscriptions, data]); 
      }
    };

    const handleUnsubscribe = async (contentType, contentId) => {
      if (!session) return;

      // Determine which column to filter by
      let query = supabase.from('subscriptions').delete().eq('user_id', session.user.id);
      if (contentType === 'post') {
        query = query.eq('post_id', contentId);
      } else if (contentType === 'project') {
        query = query.eq('project_id', contentId);
      } else {
        return; // Invalid type
      }

      const { error } = await query;

      if (error) {
        console.error(`Error unsubscribing from ${contentType}:`, error);
        alert(`Failed to unsubscribe.`);
      } else {
        // Remove the subscription from local state
        if (contentType === 'post') {
            setSubscriptions(subscriptions.filter(sub => sub.post_id !== contentId));
        } else if (contentType === 'project') {
            setSubscriptions(subscriptions.filter(sub => sub.project_id !== contentId));
        }
      }
    };





    
// --- DATA FETCHING ---

  // Main effect for fetching all session and public data
  useEffect(() => {
    setLoadingSession(true);
  
    // Helper function to fetch all data
    const fetchAllData = async (currentSession) => {
      let currentRole = 'guest';
      let profileData = null;
  
      if (currentSession) {
        // Fetch profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          profileData = data;
          currentRole = data.role;
        }
      }
      
      setProfile(profileData);
      setUserRole(currentRole);
  
      // Fetch public data (posts and projects)
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*, comments(*, author:profiles(username))')
        .order('created_at', { ascending: false });
      if (postsError) console.error('Error fetching posts:', postsError);
      else setPosts(postsData || []);
  
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (projectsError) console.error('Error fetching projects:', projectsError);
      else setProjects(projectsData || []);

      // Fetch Snippets
      const { data: snippetsData, error: snippetsError } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });
      if (snippetsError) console.error('Error fetching snippets:', snippetsError);
      else setSnippets(snippetsData || []);

      // 6. Fetch Files (Admin Only)
      fetchFiles(); 

      // Fetch Announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (announcementsError) console.error('Error fetching announcements:', announcementsError);
      else setAnnouncements(announcementsData || []);
      
      setLoadingSession(false);
    };
    
  
    // Run the fetch function for the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchAllData(session); 
    });
  
    // Set up a listener for any auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchAllData(session); 
    });
  
    // Cleanup the subscription when the component unmounts
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  // This second effect will help me populate the form fields ONLY when the profile data has been loaded
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  // --- Notification & Subscription Fetching Effect ---
  useEffect(() => {
    const fetchUserData = async () => {
      // Only proceed if the session exists (user is logged in)
      if (session) {
        
        // 1. Get the count of specifically UNREAD notifications for the badge
        const { count: unread, error: countError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true }) // head:true makes it faster
          .eq('user_id', session.user.id)
          .eq('is_read', false); // Count only unread

        if (countError) {
          console.error("Error fetching unread count:", countError);
          setUnreadCount(0); // Default to 0 on error
        } else {
          setUnreadCount(unread || 0); // Set the count for the bell
        }

        // 2. Get the list of ALL recent notifications (read and unread) for the dropdown
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', session.user.id) // Only for the current user
          // NO filter for is_read here
          .order('created_at', { ascending: false }) // Newest first
          .limit(20); // Fetch recent history (e.g., last 20)

        if (notificationsError) {
          console.error('Error fetching notifications list:', notificationsError);
          setNotifications([]); // Default to empty list on error
        } else {
          setNotifications(notificationsData || []); // Set the list for the dropdown
        }

        // 3. Fetch Subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('post_id, project_id') // I Only need the IDs
          .eq('user_id', session.user.id);

        if (subscriptionsError) {
          console.error("Error fetching subscriptions:", subscriptionsError);
        } else {
          setSubscriptions(subscriptionsData || []);
        }

      } else {
        // Clear user-specific data on logout
        setNotifications([]);
        setUnreadCount(0);
        setSubscriptions([]);
      }
    };

    fetchUserData(); // Call the function to fetch data when session changes

  }, [session]); 


    

  return (
    <>
      <nav>
        <div className="nav-container">
          <div className="logo">IF/Platform</div>
          <ul className="nav-links">
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#snippets">Snippets</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#community">Community</a></li>
          </ul>
          <div className="user-menu">
            <div
              className="notification-bell"
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              🔔
              {/* Display count if > 0 */}
              {unreadCount > 0 && (
                <span
                  className="notification-dot"
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            {/* 1. AVATAR: Goes to Profile or Login */}
            <div 
                className="user-avatar" 
                onClick={() => session ? showSection('settings') : window.location.href = '/login'} 
                style={{ cursor: 'pointer' }}
                title={session ? 'Go to Settings / Profile' : 'Sign In'}
            >
                {/* Display role initial, 'G' for Guest, or 'S' for Sign In/Default */}
                {session ? (userRole ? userRole.toUpperCase().charAt(0) : 'L') : 'S'}
            </div>
            
            {/* 2. TEXT LINK: Handles Log Out or Sign In */}
            <div 
                onClick={session ? handleLogout : () => window.location.href = '/login'} 
                style={{ cursor: 'pointer', paddingLeft: '1rem' }}
                title={session ? 'Log Out' : 'Sign In'}
            >
                {session ? 'LOG OUT' : 'SIGN IN'}
            </div>

            {/* Notification Dropdown */}
            {isNotificationDropdownOpen && (
              <div 
                className="notification-dropdown" 
                style={{
                  position: 'absolute',
                  top: '60px', /* Adjust as needed based on your navbar height */
                  right: '20px',
                  width: '300px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  background: 'var(--dark)',
                  border: '1px solid var(--grey-dark)',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                  color: 'var(--white)'
                }}
              >
                <h4 style={{ padding: '1rem', borderBottom: '1px solid var(--grey-dark)', margin: 0 }}>Notifications</h4>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      onClick={() => handleNotificationClick(notification.id, notification.link_url)}
                      style={{ padding: '1rem', borderBottom: '1px solid var(--grey-dark)', cursor: 'pointer', opacity: notification.is_read ? 0.6 : 1,
                      background: notification.is_read ? 'transparent' : 'rgba(255, 255, 255, 0.05)' // Slight background for unread

                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{notification.content}</p>
                      <small style={{ color: 'var(--grey-light)' }}>{new Date(notification.created_at).toLocaleDateString()}</small>
                    </div>
                  ))
                ) : (
                  <p style={{ padding: '1rem', textAlign: 'center' }}>No new notifications.</p>
                )}
                {/* Optional: Add a "Mark all as read" button here */}
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
              <li><a href="#" className={activeSection === 'dashboard' ? 'active' : ''} onClick={() => showSection('dashboard')}>📊 Dashboard</a></li>
              <li><a href="#" className={activeSection === 'projects' ? 'active' : ''} onClick={() => showSection('projects')}>📁 Projects</a></li>
              <li><a href="#" className={activeSection === 'snippets' ? 'active' : ''} onClick={() => showSection('snippets')}>📝 Game Snippets</a></li>
              <li><a href="#" className={activeSection === 'blog' ? 'active' : ''} onClick={() => showSection('blog')}>✍️ Blog Posts</a></li>
              <li><a href="#" className={activeSection === 'announcements' ? 'active' : ''} onClick={() => showSection('announcements')}>📢 Announcements</a></li>
            </ul>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">Tools</div>
            <ul className="sidebar-menu">
              
              {/* ADMIN-ONLY SECTIONS START */}
              {userRole === 'admin' && (
                <>
                  {/* Analytics (Admin Only) */}
                  <li><a href="#" className={activeSection === 'stats' ? 'active' : ''} onClick={() => showSection('stats')}>📈 Analytics</a></li>
                  
                  {/* File Manager (Admin Only) */}
                  <li><a href="#" className={activeSection === 'file-manager' ? 'active' : ''} onClick={() => showSection('file-manager')}>📤 File Manager</a></li>
                </>
              )}
              {/*ADMIN-ONLY SECTIONS END */}
              
              {/* Profile (Visible to all logged-in users) */}
              {userRole !== 'guest' && (
                <li><a href="#" className={activeSection === 'settings' ? 'active' : ''} onClick={() => showSection('settings')}>👤 Profile</a></li>
              )}

            </ul>
          </div>
          
        </aside>

        <main className="content">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div id="dashboard-section" className="section">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h1>Dashboard</h1>
                <p className="dashboard-subtitle">Welcome back! Here's what's happening with your interactive fiction.</p>
              </div>
              <div className="action-buttons">
                {userRole === 'admin' && (
                  <button className="btn" onClick={openNewSnippetModal}>Upload Snippet</button>
                )}
                {userRole === 'admin' && (
                <button className="btn btn-primary" onClick={openNewPostModal}>New Post</button>
                )}
              </div>
            </div>
                
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Reads</div>
                <div className="stat-value">24,531</div>
                <div className="stat-change">+12% this week</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Projects</div>
                <div className="stat-value">3</div>
                <div className="stat-change">1 near completion</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Game Snippets</div>
                <div className="stat-value">47</div>
                <div className="stat-change">5 new this month</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Community Members</div>
                <div className="stat-value">892</div>
                <div className="stat-change">+45 this week</div>
              </div>
            </div>

            <div className="content-grid">
              <div className="content-card">
                <div className="content-header">
                  <div>
                    <h2 className="content-title">Recent Activity</h2>
                    <p className="content-meta">Your latest updates and interactions</p>
                  </div>
                </div>
                <div className="activity-feed">
                  <div className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-content">
                      <div className="activity-text">Published new snippet: "Advanced Choice Logic"</div>
                      <div className="activity-time">2 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">💬</div>
                    <div className="activity-content">
                      <div className="activity-text">15 new comments on "Building Complex Narratives"</div>
                      <div className="activity-time">5 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">🎮</div>
                    <div className="activity-content">
                      <div className="activity-text">Project "Echoes of Tomorrow" reached 10k plays</div>
                      <div className="activity-time">1 day ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">✨</div>
                    <div className="activity-content">
                      <div className="activity-text">New follower milestone: 500 followers</div>
                      <div className="activity-time">2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div id="projects-section" className="section">
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h1>My Projects</h1>
                <p className="dashboard-subtitle">Manage your interactive fiction projects</p>
              </div>
              <div className="action-buttons">
                {/* ADMIN CHECK: Only show if the user is an admin */}
                {userRole=== 'admin' && (
                    <button className="btn btn-primary" onClick={openNewProjectModal}>New Project</button>
                )}
              </div>
            </div>

            {/* inside the 'projects' section */}
            <div className="content-grid">
            {projects
            .sort((a, b) => b.is_pinned - a.is_pinned)
            .map((project) => (
                <div key={project.id} 
                  className="content-card"
                  data-project-id={project.id}
                >
                <div className="content-header">
                  <div>
                    <h2 className="content-title">{project.title}</h2>
                    <p className="content-meta">Sci-fi Adventure • 185,000 words • In Development</p>
                  </div>
                  {/* Project Status Badge */}
                  <span className="content-badge">Active</span>

                  {/* Subscribe Button */}
                  {session && ( 
                    subscriptions.some(sub => sub.project_id === project.id) ? (
                      <button className="btn btn-secondary" onClick={() => handleUnsubscribe('project', project.id)}>Unsubscribe</button>
                    ) : (
                      <button className="btn" onClick={() => handleSubscribe('project', project.id)}>Subscribe</button>
                    )
                  )}

                  {/* Admin Pin Button */}
                  {userRole === 'admin' && (
                    <button className="btn-link" onClick={() => handlePinProject(project.id, project.is_pinned)}>
                      {project.is_pinned ? 'Unpin' : 'Pin 📌'}
                    </button>
                  )}
                </div>

                {/* Pinned Badge */}
                {project.is_pinned && <span className="pinned-badge">Pinned</span>}

                {/* CORRECTED: Only ONE description, outside the header, with the style */}
                <p style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p>

                {/* Buttons Div */}
                
                <div style={{ marginTop: '1.5rem' }}>
                    
                    {/* ADMIN CHECK: Protect Stats/Edit/Delete buttons */}
                    {userRole === 'admin' && (
                        <>
                        <button 
                            className="btn" 
                            style={{ marginLeft: '1rem' }}
                        >
                            View Stats
                        </button>
                        <button 
                            className="btn"
                            onClick={() => openEditProjectModal(project)} 
                            style={{ marginLeft: '1rem' }}
                        >
                            Edit Project
                        </button>
                        <button 
                            className="btn btn-danger" 
                            onClick={() => handleDeleteProject(project.id)} 
                            style={{ marginLeft: '1rem' }}
                        >
                            Delete
                        </button>
                        </>
                    )}
                </div>
                </div>
            ))}
            </div>
          </div>
          )}

          {/* Game Snippets Section */}
          {activeSection === 'snippets' && (
            <div id="snippets-section" className="section">
              <div className="dashboard-header">
                <div className="dashboard-title">
                  <h1>Game Snippets</h1>
                  <p className="dashboard-subtitle">Explore demos and snippets from various projects</p>
                </div>
                <div className="action-buttons">
                  {userRole === 'admin' && (
                    <button className="btn btn-primary" onClick={openNewSnippetModal}>
                      Add New Snippet
                    </button>
                  )}
                </div>
              </div>

              <div className="content-grid">
                {snippets.map((snippet) => (
                  <div key={snippet.id} className="content-card">
                    {/* Optional: Display an image if I have one */}
                    {snippet.image_url && <img src={snippet.image_url} alt={snippet.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />}
                    
                    <div style={{ padding: '1rem' }}>
                      <h2 className="content-title">{snippet.title}</h2>
                      <p className="content-meta">Added on {new Date(snippet.created_at).toISOString().split('T')[0]}</p>
                      <p>{snippet.description}</p>
                      <div style={{ marginTop: '1.5rem' }}>
                        {/* This link opens the demo in a new tab */}
                        <a href={snippet.game_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                          View Full Demo
                        </a>
                        {/* Admin Edit/Delete Buttons */}
                        {userRole === 'admin' && (
                          <>
                            <button className="btn" onClick={() => openEditSnippetModal(snippet)}>Edit</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteSnippet(snippet.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

            {/* Editor Section */}
            {activeSection === 'editor' && (
            <div id="editor-section" className="section">
                <div className="dashboard-header">
                    <div className="dashboard-title">
                        <h1>Code Editor</h1>
                        <p className="dashboard-subtitle">Write and test your ChoiceScript code</p>
                    </div>
                    <div className="action-buttons">
                        <button className="btn">Save</button>
                        <button className="btn">Test</button>
                        <button className="btn btn-primary">Publish</button>
                    </div>
                </div>

                <div className="editor-container">
                    <div className="editor-toolbar">
                        <button className="editor-btn">File</button>
                        <button className="editor-btn">Edit</button>
                        <button className="editor-btn">View</button>
                        <button className="editor-btn">Insert</button>
                        <button className="editor-btn">Format</button>
                        <button className="editor-btn">Tools</button>
                    </div>
                    <textarea className="editor-content" placeholder="Start writing your ChoiceScript code here...">*title My Interactive Story
*author Your Name
*scene_list
  startup
  chapter1
  chapter2

*comment This is where your story begins

You wake up in a mysterious room with no memory of how you got there.

*choice
  #Look around the room
    You notice a door and a window.
    *goto explore_room
  #Call for help
    Your voice echoes in the empty space.
    *goto call_out
  #Try to remember
    Fragments of memory begin to surface.
    *goto remember</textarea>
                </div>
            </div>
            )}

            {/* Blog Section */}
            {activeSection === 'blog' && (
              <div id="blog-section" className="section">
                <div className="dashboard-header">
                  <div className="dashboard-title">
                    <h1>Blog Posts</h1>
                    <p className="dashboard-subtitle">Share your thoughts and development insights</p>
                  </div>
                  <div className="action-buttons">
                    {userRole === 'admin' && (
                      <button className="btn btn-primary" onClick={openNewPostModal}>New Post</button>
                    )}
                  </div>
                </div>

                <div className="content-grid">
                  {/* This is the main loop that will help me create the 'post' variable */}
                  {posts
                  .sort((a, b) => b.is_pinned - a.is_pinned)
                  .map((post) => (
                    <div key={post.id} 
                    className="content-card"
                    data-post-id={post.id}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="content-title">{post.title}</h2>

                        {/* Subscribe Button for Posts */}
                        {session && ( // Only show if logged in
                          subscriptions.some(sub => sub.post_id === post.id) ? (
                            <button className="btn btn-secondary" onClick={() => handleUnsubscribe('post', post.id)}>Unsubscribe</button>
                          ) : (
                            <button className="btn" onClick={() => handleSubscribe('post', post.id)}>Subscribe</button>
                          )
                        )}

                        {/* Admin-only Pin Button for Posts */}
                        {userRole === 'admin' && (
                          <button className="btn-link" onClick={() => handlePinPost(post.id, post.is_pinned)}>
                            {post.is_pinned ? 'Unpin' : 'Pin 📌'}
                          </button>
                        )}

                        {/* Admin Edit/Delete Buttons for Posts */}
                        {userRole === 'admin' && (
                          <>
                            <button className="btn" onClick={() => openEditPostModal(post)}>Edit</button>
                            <button className="btn btn-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                          </>
                        )}
                      </div>

                      {/* Pinned Badge for Posts */}
                      {post.is_pinned && <span className="pinned-badge">Pinned</span>}

                      <p className="content-meta">Published on {new Date(post.created_at).toISOString().split('T')[0]}</p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>

                      {/* --- Comments Section --- */}
                      <div className="comments-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--grey-dark)', paddingTop: '1rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Comments ({post.comments.length})</h3>

                        {/* Display existing comments */}
                        <div className="comments-list">
                          {post.comments
                            .sort((a, b) => b.is_pinned - a.is_pinned) // Pinned comments first
                            .filter(comment => !comment.parent_id)
                            .map((comment) => (
                              <div key={comment.id} 
                                className="comment-item" 
                                data-comment-id={comment.id} 
                                style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--grey-dark)' }}
                              >

                                {/* Conditionally render Edit Form or Comment Content */}
                                {editingCommentId === comment.id ? (
                                  <form onSubmit={(e) => handleUpdateComment(e, comment.id)}>
                                    <textarea
                                      className="form-textarea"
                                      value={editingCommentContent}
                                      onChange={(e) => setEditingCommentContent(e.target.value)}
                                    ></textarea>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                      <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                                      <button type="button" className="btn" onClick={() => setEditingCommentId(null)} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                                    </div>
                                  </form>
                                ) : (
                                  <>
                                    {comment.is_pinned && <span className="pinned-badge" style={{ float: 'right', fontSize: '0.8rem', fontWeight: 'bold' }}>📌 Pinned</span>}
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                                    <p className="content-meta" style={{ fontSize: '0.8rem' }}>
                                      Comment by <strong>{comment.author ? comment.author.username : 'Anonymous'}</strong> on {new Date(comment.created_at).toISOString().split('T')[0]}
                                    </p>

                                    <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                      {session && (<button className="btn-link" onClick={() => setReplyingToCommentId(comment.id)}>Reply</button>)}
                                      
                                      {/* User's own Edit/Delete buttons */}
                                      {session && session.user.id === comment.author_id && (
                                        <>
                                          <button className="btn-link" onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }}>Edit</button>
                                          <button className="btn-link" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                                        </>
                                      )}

                                      {/* Admin Pin button */}
                                      {userRole === 'admin' && (<button className="btn-link" onClick={() => handlePinComment(comment.id, comment.is_pinned)}>{comment.is_pinned ? 'Unpin' : 'Pin'}</button>)}
                                    </div>
                                  </>
                                )}

                                {/* Nested Replies */}
                                <div className="replies" style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                                  {post.comments
                                    .sort((a, b) => b.is_pinned - a.is_pinned) // Pinned replies first
                                    .filter(reply => reply.parent_id === comment.id)
                                    .map((reply) => (
                                      <div key={reply.id} 
                                        className="comment-item" 
                                        data-comment-id={reply.id}
                                        style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--grey-dark)' }}
                                      >
      
                                        {/* Conditionally render Edit Form or Reply Content */}
                                        {editingCommentId === reply.id ? (
                                          <form onSubmit={(e) => handleUpdateComment(e, reply.id)}>
                                            <textarea
                                              className="form-textarea"
                                              value={editingCommentContent}
                                              onChange={(e) => setEditingCommentContent(e.target.value)}
                                            ></textarea>
                                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                              <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                                              <button type="button" className="btn" onClick={() => setEditingCommentId(null)} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                                            </div>
                                          </form>
                                        ) : (
                                          <>
                                            {reply.is_pinned && <span className="pinned-badge" style={{ float: 'right', fontSize: '0.8rem', fontWeight: 'bold' }}>📌 Pinned</span>}
                                            <p style={{ whiteSpace: 'pre-wrap' }}>{reply.content}</p>
                                            <p className="content-meta" style={{ fontSize: '0.8rem' }}>
                                              Reply by <strong>{reply.author ? reply.author.username : 'Anonymous'}</strong> on {new Date(reply.created_at).toISOString().split('T')[0]}
                                            </p>
                                            
                                            <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                              {/* User's own Edit/Delete buttons for the reply */}
                                              {session && session.user.id === reply.author_id && (
                                                <>
                                                  <button className="btn-link" onClick={() => { setEditingCommentId(reply.id); setEditingCommentContent(reply.content); }}>Edit</button>
                                                  <button className="btn-link" onClick={() => handleDeleteComment(reply.id)}>Delete</button>
                                                </>
                                              )}

                                              {/* Admin Pin button for the reply */}
                                              {userRole === 'admin' && (<button className="btn-link" onClick={() => handlePinComment(reply.id, reply.is_pinned)}>{reply.is_pinned ? 'Unpin' : 'Pin'}</button>)}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                </div>

                                {/* Reply Form */}
                                {replyingToCommentId === comment.id && (
                                  <form onSubmit={(e) => handleCreateComment(e, post.id, comment.id)} style={{ marginTop: '1rem', marginLeft: '2rem' }}>
                                    <div className="form-group">
                                      <textarea
                                        className="form-textarea"
                                        placeholder={`Replying to ${comment.author?.username || 'Anonymous'}...`}
                                        value={newCommentContent}
                                        onChange={(e) => setNewCommentContent(e.target.value)}
                                        required
                                      ></textarea>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                      <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                                        Post Reply
                                      </button>
                                      <button type="button" className="btn" onClick={() => setReplyingToCommentId(null)} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            ))}
                        </div>

                        {/* Main Comment Form */}
                        {session && (
                          <form onSubmit={(e) => handleCreateComment(e, post.id, null)} style={{ marginTop: '1.5rem' }}>
                            <div className="form-group">
                              <textarea
                                className="form-textarea"
                                placeholder="Add a comment..."
                                value={newCommentContent}
                                onChange={(e) => setNewCommentContent(e.target.value)}
                                required
                              ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                              Post Comment
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div id="settings-section" className="section">
                <div className="dashboard-header">
                  <div className="dashboard-title">
                    <h1>Profile</h1>
                    <p className="dashboard-subtitle">Manage your personal account and preferences</p>
                  </div>
                </div>

                <div className="content-grid">
                  <div className="content-card">
                    <h2 className="content-title">Profile Settings</h2>
                    {/* UPDATED: Add onSubmit handler to the form */}
                    <form onSubmit={handleUpdateProfile}>
                      <div className="form-group">
                        <label className="form-label">Display Name</label>
                        {/* Connect input to state */}
                        <input
                          type="text"
                          className="form-input"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Bio</label>
                        {/* Connect textarea to state */}
                        <textarea
                          className="form-textarea"
                          placeholder="Tell us about yourself..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        ></textarea>
                      </div>
                      
                      {/* Button is now type="submit" */}
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    </form>
                  </div>

                    <div className="content-card">
                        <h2 className="content-title">Notification Preferences</h2>
                        <div className="form-group">
                            <label className="form-label">
                                <input type="checkbox" defaultChecked/> Email notifications for comments
                            </label>
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <input type="checkbox" defaultChecked/> Weekly digest emails
                            </label>
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <input type="checkbox" defaultChecked/> Marketing emails
                            </label>
                        </div>
                        <button className="btn btn-primary">Update Preferences</button>
                    </div>
                </div>
            </div>
            )}

            {/* File Manager Section (Admin Only) */}
            {activeSection === 'file-manager' && userRole === 'admin' && (
              <div id="file-manager-section" className="section">
                <div className="dashboard-header">
                  <div className="dashboard-title">
                    <h1>File Manager</h1>
                    <p className="dashboard-subtitle">Securely manage and host your project assets.</p>
                  </div>
                </div>

                {/* File Upload Form */}
                <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--grey-dark)' }}>
                  <h2>Upload New File</h2>
                  <form onSubmit={handleFileUpload}>
                    <div className="form-group">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        required
                        disabled={uploading}
                        style={{ border: 'none', padding: '0' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile}>
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </form>
                </div>

                {/* File List */}
                <h2>Current Assets ({files.length})</h2>
                <div className="file-list" style={{ marginTop: '1rem' }}>
                  {files.map((file) => (
                    <div 
                      key={file.name} 
                      className="file-item" 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.75rem', 
                        borderBottom: '1px solid var(--grey-dark)' 
                      }}
                    >
                      <div style={{ flexGrow: 1 }}>
                        <strong style={{ display: 'block' }}>{file.name}</strong>
                        <small>Last Updated: {new Date(file.updated_at).toLocaleDateString()}</small>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={async () => {
                            const url = await getPublicUrl(file.name);
                            if (url) {
                              navigator.clipboard.writeText(url);
                              alert(`URL copied for ${file.name}. (Temporary link)`);
                            } else {
                              alert('Could not generate URL. Check admin permissions.');
                            }
                          }}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          Copy URL
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteFile(file.name)}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {files.length === 0 && <p>No files found in the asset manager.</p>}
                </div>
              </div>
            )}

            {/* Announcements Section */}
            {activeSection === 'announcements' && (
              <div id="announcements-section" className="section">
                <div className="dashboard-header">
                  <div className="dashboard-title">
                    <h1>Announcements</h1>
                    <p className="dashboard-subtitle">Latest news and updates for the community.</p>
                  </div>
                  <div className="action-buttons">
                    {/* We'll add the "New Announcement" modal and button in the next step */}
                    {userRole === 'admin' && (
                      <button className="btn btn-primary" onClick={openNewAnnouncementModal}>New Announcement</button>
                    )}
                  </div>
                </div>

                <div className="announcements-list">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} 
                      className="card" 
                      data-announcement-id={announcement.id}
                      style={{ marginBottom: '1.5rem', padding: '1.5rem' }}
                    >
                      <h2 className="content-title">{announcement.title}</h2>
                      <p className="content-meta">
                        Posted on {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                      <div className="announcement-content" style={{ marginTop: '1rem' }}>
                      <ReactMarkdown>{announcement.content}</ReactMarkdown>
                    </div>
                    </div>
                  ))}
                  {announcements.length === 0 && <p>No announcements yet.</p>}
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {activeSection === 'stats' && (
            <div id="stats-section" className="section">
                <div className="dashboard-header">
                    <div className="dashboard-title">
                        <h1>Analytics</h1>
                        <p className="dashboard-subtitle">Track your content performance and engagement</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Views This Month</div>
                        <div className="stat-value">15,432</div>
                        <div className="stat-change">+23% from last month</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Unique Visitors</div>
                        <div className="stat-value">8,901</div>
                        <div className="stat-change">+18% from last month</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Engagement Rate</div>
                        <div className="stat-value">67%</div>
                        <div className="stat-change">+5% from last month</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">New Followers</div>
                        <div className="stat-value">124</div>
                        <div className="stat-change">+31% from last month</div>
                    </div>
                </div>

                <div className="content-grid">
                    <div className="content-card">
                        <h2 className="content-title">Top Performing Content</h2>
                        <div className="activity-feed">
                            <div className="activity-item">
                                <div className="activity-icon">📝</div>
                                <div className="activity-content">
                                    <div className="activity-text">Advanced Choice Logic Snippet</div>
                                    <div className="activity-time">2,341 views • 89 likes</div>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">📖</div>
                                <div className="activity-content">
                                    <div className="activity-text">Building Complex Narratives</div>
                                    <div className="activity-time">1,876 views • 67 likes</div>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">🎮</div>
                                <div className="activity-content">
                                    <div className="activity-text">Echoes of Tomorrow Demo</div>
                                    <div className="activity-time">1,234 plays • 156 favorites</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </main>
    </div>

    {/* New Snippet Modal */}
    {isNewSnippetModalOpen && (
      <div id="new-snippet-modal" className="modal active">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Add New Game Snippet</h2>
            <span className="modal-close" onClick={closeNewSnippetModal}>&times;</span>
          </div>
          <form onSubmit={handleCreateSnippet}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={newSnippetTitle}
                onChange={(e) => setNewSnippetTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={newSnippetDescription}
                onChange={(e) => setNewSnippetDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Game Demo URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://dashingdon.com/play/..."
                value={newSnippetGameUrl}
                onChange={(e) => setNewSnippetGameUrl(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cover Image URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/image.png"
                value={newSnippetImageUrl}
                onChange={(e) => setNewSnippetImageUrl(e.target.value)}
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <button type="button" className="btn" onClick={closeNewSnippetModal} style={{ marginRight: '1rem' }}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Snippet</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* New Post Modal */}
    {isNewPostModalOpen && (
    <div id="newpost-modal" className="modal active">
        <div className="modal-content">
            <div className="modal-header">
                <h2>Create New Blog Post</h2>
                <span className="modal-close" onClick={closeNewPostModal}>&times;</span>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">Post Title</label>
                {/* UPDATED: Connect state to the input */}
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter post title" 
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                {/* Connect state to the textarea */}
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '300px' }} 
                  placeholder="Write your blog post content here..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                ></textarea>
              </div>
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={closeNewPostModal} style={{ marginRight: '1rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Post</button>
              </div>
            </form>
        </div>
    </div>
    )}

    {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div id="newproject-modal" className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <span className="modal-close" onClick={closeNewProjectModal}>&times;</span>
            </div>
            {/* My Form now has onSubmit handler */}
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                {/* Input is now controlled by state */}
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter project name" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                {/* Textarea is now controlled by state */}
                <textarea 
                  className="form-textarea" 
                  placeholder="Describe your interactive fiction project..."
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                ></textarea>
              </div>
              
              {/* Other form fields like Genre can be added here later */}

              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={closeNewProjectModal} style={{ marginRight: '1rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

    {/* Edit Project Modal */}
    {isEditProjectModalOpen && editingProject && (
        <div id="edit-project-modal" className="modal active">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Project: {editingProject.title}</h2>
                    <span className="modal-close" onClick={closeEditProjectModal}>&times;</span>
                </div>
                
                {/* Form now uses handleUpdateProject */}
                <form onSubmit={handleUpdateProject}>
                    <div className="form-group">
                        <label className="form-label">Project Name</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Enter project name" 
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea 
                            className="form-textarea" 
                            placeholder="Describe your interactive fiction project..."
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                        ></textarea>
                    </div>
                    
                    <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                        <button type="button" className="btn" onClick={closeEditProjectModal} style={{ marginRight: '1rem' }}>Cancel</button>
                        {/* Button text is clearly "Save Changes" for editing */}
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    )}

    {/* Edit Snippet Modal */}
    {isEditSnippetModalOpen && (
      <div id="edit-snippet-modal" className="modal active">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Edit Game Snippet</h2>
            <span className="modal-close" onClick={closeEditSnippetModal}>&times;</span>
          </div>
          <form onSubmit={handleUpdateSnippet}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" className="form-input" value={newSnippetTitle} onChange={(e) => setNewSnippetTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={newSnippetDescription} onChange={(e) => setNewSnippetDescription(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Game Demo URL</label>
              <input type="url" className="form-input" value={newSnippetGameUrl} onChange={(e) => setNewSnippetGameUrl(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Cover Image URL (Optional)</label>
              <input type="url" className="form-input" value={newSnippetImageUrl} onChange={(e) => setNewSnippetImageUrl(e.target.value)} />
            </div>
            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <button type="button" className="btn" onClick={closeEditSnippetModal} style={{ marginRight: '1rem' }}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    )}


    {/* Edit Post Modal */}
    {isEditPostModalOpen && (
      <div id="edit-post-modal" className="modal active">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Edit Blog Post</h2>
            <span className="modal-close" onClick={closeEditPostModal}>&times;</span>
          </div>
          <form onSubmit={handleUpdatePost}>
            <div className="form-group">
              <label className="form-label">Post Title</label>
              <input type="text" className="form-input" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea className="form-textarea" style={{ minHeight: '300px' }} value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)}></textarea>
            </div>
            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <button type="button" className="btn" onClick={closeEditPostModal} style={{ marginRight: '1rem' }}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    )}


    {/* New Announcement Modal */}
    {isNewAnnouncementModalOpen && (
      <div id="new-announcement-modal" className="modal active">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Create New Announcement</h2>
            <span className="modal-close" onClick={closeNewAnnouncementModal}>&times;</span>
          </div>
          <form onSubmit={handleCreateAnnouncement}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={newAnnouncementTitle}
                onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '200px' }}
                value={newAnnouncementContent}
                onChange={(e) => setNewAnnouncementContent(e.target.value)}
                required
              ></textarea>
            </div>
            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <button type="button" className="btn" onClick={closeNewAnnouncementModal} style={{ marginRight: '1rem' }}>Cancel</button>
              <button type="submit" className="btn btn-primary">Post Announcement</button>
            </div>
          </form>
        </div>
      </div>
    )}


    {/* Upload File Modal */}
    <div id="upload-file-modal" className="modal">
        <div className="modal-content">
            <div className="modal-header">
                <h2>Upload Files</h2>
                <span className="modal-close">&times;</span>
            </div>
            <div className="upload-area" id="drag-drop-area">
                <h3>Drop files here or click to browse</h3>
                <p>Support for .txt, .doc, .docx, and image files (max 10MB each)</p>
                <div className="file-input-wrapper">
                    <input type="file" id="modal-file-upload" multiple accept=".txt,.doc,.docx,.png,.jpg,.jpeg,.gif"/>
                    <label htmlFor="modal-file-upload" className="file-input-label">Choose Files</label>
                </div>
            </div>
            <div id="file-list" style={{ marginTop: '1rem' }}></div>
            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button type="button" className="btn" style={{ marginRight: '1rem' }}>Cancel</button>
                <button type="button" className="btn btn-primary">Upload Files</button>
            </div>
        </div>
    </div>
    </>
  );
}








