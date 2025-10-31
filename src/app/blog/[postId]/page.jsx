import { Suspense } from 'react';
import { supabase } from '../../utils/supabaseClient'; 
import BlogPostPageContent from './BlogPostPageContent';

// --- 1. THE METADATA FUNCTION (RUNS ON SERVER) ---
export async function generateMetadata({ params }) {
  const { postId } = params; 

  // Create a Supabase client for server-side operations
  // Note: For server-side, you'd typically use a service role or a different client setup,
  // but for a simple read-only operation like this, your existing client should work
  // as long as RLS is set up for public reads on 'posts'.
  
  const { data: post, error } = await supabase
    .from('posts')
    .select('title, content, image_url') 
    .eq('id', postId) // Your param is 'postId'
    .single();

  if (error || !post) {
    return {
      title: 'Post not found | Lota Labs',
    };
  }

  // Create a simple description from the post content
  const description = post.content 
    ? post.content.substring(0, 155).replace(/\n/g, ' ') + '...' 
    : 'A blog post from Lota Labs';

  return {
    title: `${post.title} | Lota Labs`,
    description: description,
    // Optional: Add Open Graph tags for social sharing (could use later)
    openGraph: {
      title: `${post.title} | Lota Labs`,
      description: description,
      images: [
        {
          // IMPORTANT: Add a default fallback image URL here for posts without an image
          url: post.image_url || 'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/logo.png', 
          width: 1200,
          height: 630,
        },
      ],
    },
    // Optional: Add Twitter card tags (I may use this later)
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Lota Labs`,
      description: description,
       // IMPORTANT: Add a default fallback image URL here
      images: [post.image_url || 'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761839450595_logo.png'],
    },
  };
}

// --- 2. THE PAGE COMPONENT (My OLD WRAPPER) ---
export default function BlogPostPageWrapper({ params }) {
  return (
    <Suspense fallback={<div>Loading Post...</div>}>
      {/* Pass the server-side 'params' directly 
        to the new client component.
      */}
      <BlogPostPageContent params={params} />
    </Suspense>
  );
}