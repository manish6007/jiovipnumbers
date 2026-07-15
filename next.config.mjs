/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost }]
        : [{ protocol: "https", hostname: "*.supabase.co" }]),
    ],
  },
  eslint: {
    // Lint is run explicitly in CI via `npm run lint`; don't fail production builds on it.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
