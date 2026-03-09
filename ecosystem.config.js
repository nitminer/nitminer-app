module.exports = {
  apps: [
    {
      name: "nitminer-app",
      script: "./server.js",

      // Use only 1 instance (secondary app)
      instances: 1,
      exec_mode: "cluster",

      env: {
        NODE_ENV: "production",
        PORT: 7070,
        ALLOWED_DOMAINS: "www.nitminer.com",
        REDIRECT_DOMAIN: "nitminer.com",
        NODE_OPTIONS: "--max-old-space-size=2048"
      },

      error_file: "./logs/nitminer-error.log",
      out_file: "./logs/nitminer-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      watch: false,
      ignore_watch: ["node_modules", ".next", ".git", "logs"],

      max_memory_restart: "2000M",

      autorestart: true,
      max_restarts: 10,
      min_uptime: "30s",

      listen_timeout: 5000,
      kill_timeout: 10000
    }
  ]
};