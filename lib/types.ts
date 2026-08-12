export type MediaType = "image" | "video";

export type Tag = { id: string; name: string };

export type Memory = {
  id: string;
  title: string;
  media_type: MediaType;
  original_filename: string;
  storage_key: string;
  media_url: string;
  thumbnail_key: string;
  thumbnail: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  duration_seconds: number | null;
  captured_at: string;
  uploaded_at: string;
  location_name: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  notes: string;
  device_name: string;
  is_highlight: boolean;
  highlight_caption: string;
  tags: string[];
  project_id: string | null;
  workspace_id?: string;
};

export type ProjectStatus = "active" | "draft" | "done" | "archived";

export type Project = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  due_date: string | null;
  goal: string;
  location: string;
  moodboard: string[];
  notes: string;
  cover_memory_id: string | null;
  created_at: string;
  shot_list: ShotItem[];
  workspace_id?: string;
};

export type ShotItem = {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  order_index: number;
};

export type Inspiration = {
  id: string;
  category: string;
  title: string;
  summary: string;
  difficulty: "easy" | "medium" | "hard";
  locationTypes: string[];
  moods: string[];
  durationRange: string;
  orientation: string;
  movement: string;
  shotList: string[];
  transition: string;
  soundIdea: string;
  editingTip: string;
  favorite: boolean;
};

export type HighlightCollection = {
  id: string;
  title: string;
  description: string;
  memory_ids: string[];
  workspace_id?: string;
};

export type Place = { name: string; city: string; country: string; count: number };

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
