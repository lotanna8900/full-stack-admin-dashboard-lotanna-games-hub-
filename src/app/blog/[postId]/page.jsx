import { Suspense } from 'react';
import { supabase } from '../../utils/supabaseClient'; 
import BlogPostPageContent from './BlogPostPageContent';

// --- 1. THE METADATA FUNCTION (RUNS ON SERVER) ---
export async function generateMetadata({ params }) {
  const { postId } = params; 
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

export default function BlogPostPageWrapper({ params }) {
  const paramsPromise = Promise.resolve(params);

  return (
    <Suspense fallback={<div>Loading Post...</div>}>
      {/* This now passes a Promise, which is what 
        your client component (with the 'use()' hook) expects.
      */}
      <BlogPostPageContent params={paramsPromise} />
    </Suspense>
  );
}