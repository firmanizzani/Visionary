// Only PUBLIC_* variables are exposed by the Vite configuration.
export const env = {
 PUBLIC_API_BASE_URL: import.meta.env.PUBLIC_API_BASE_URL as string | undefined,
 PUBLIC_MODEL_URL: import.meta.env.PUBLIC_MODEL_URL as string | undefined,
 PUBLIC_MODEL_VERSION: import.meta.env.PUBLIC_MODEL_VERSION as string | undefined
};
