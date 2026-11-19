import detector from './model.json';
import verifier from './verifier.json';
export const MODEL = detector;
export const MODEL_LABELS = detector.labels;
export const MODEL_VERSION = `${detector.version}-${verifier.name.toLowerCase()}-${verifier.textSha256.slice(0,8)}`;
export const VERIFIER = verifier;
