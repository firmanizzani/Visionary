export type Mode = 'box' | 'mask' | 'both';
export type DetectedObject = { class_id: number; object_name: string; confidence: number; bounding_box: [number, number, number, number]; segmentation_data: { width: number; height: number; rle: number[] } | null };
export type Detection = { id: string; source_type: 'image' | 'camera'; detected_at: string; model_version: string; confidence_threshold: number; total_objects: number; width: number; height: number; image_url: string; objects: DetectedObject[] };
export type User = { id: string; full_name: string; email: string; created_at: string };
export type Settings = { confidence_threshold: number; visualization_mode: Mode; show_confidence: boolean; preferred_camera: string | null };
export type Summary = { total_detections: number; total_objects: number; unique_categories: number; average_confidence: number; most_detected: string | null };
