const remotePatterns = [
  {
    protocol: "https",
    hostname: "images.unsplash.com"
  },
  {
    protocol: "https",
    hostname: "plus.unsplash.com"
  },
  {
    protocol: "https",
    hostname: "res.cloudinary.com"
  }
];

const supabaseUrl = process.env.SUPABASE_URL?.trim();

if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {})
    });
  } catch {
    // Ignore invalid URLs in env; image loading will fail visibly until fixed.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns
  }
};

export default nextConfig;
