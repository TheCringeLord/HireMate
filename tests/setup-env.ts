// Minimal environment variable shims for tests.
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "test";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.DB_USER = process.env.DB_USER || "test";
process.env.DB_NAME = process.env.DB_NAME || "testdb";
process.env.ARCJET_KEY = process.env.ARCJET_KEY || "test-arcjet";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "test-clerk";
process.env.HUME_API_KEY = process.env.HUME_API_KEY || "test-hume";
process.env.HUME_SECRET_KEY = process.env.HUME_SECRET_KEY || "test-hume-secret";
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-gemini";
