// Jest mock for src/constants/index.ts
// The real file uses import.meta.env (Vite-only) which is not available in Jest/Node.
// Tests that depend on the API base URL can override this value per-test via jest.mock().
module.exports = {
    APPLICATION_URL: 'http://localhost',
};
