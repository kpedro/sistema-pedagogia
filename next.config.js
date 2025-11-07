/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/adapter-libsql", "@libsql/client", "html-docx-js", "puppeteer-core"]
  }
};

module.exports = nextConfig;
