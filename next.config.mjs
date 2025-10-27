/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rkhmjcwqsmgzqtmvdblm.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/admin-assets/**', 
      },
    ],
  },
};

export default nextConfig;