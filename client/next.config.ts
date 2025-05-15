import type { NextConfig } from "next";
const fs = require('fs');

const nextConfig: NextConfig = {
   devServer: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
  },
  /* config options here */
};

export default nextConfig;

