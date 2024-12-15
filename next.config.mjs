/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    webpack: (
        config,
        {buildId, dev, isServer, defaultLoaders, nextRuntime, webpack}
    ) => {
        if (config.cache && !dev) {
            config.cache = Object.freeze({
                type: 'memory',
            })
        }
        // Important: return the modified config
        return config
    },
};

export default nextConfig;
