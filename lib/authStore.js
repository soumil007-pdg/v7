// Shared in-memory auth store across all API routes
const users = new Map();
const sessions = new Map();

export const authStore = {
  users,
  sessions,
};
