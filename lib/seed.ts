import { coverSvg } from "./cover";
import type { Inspiration, Memory, Project } from "./types";

function iso(daysAgo: number, hour = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const S: Array<Partial<Memory> & { title: string; place: string; city: string; country: string; lat: number; lng: number; seed: number; days: number; is_highlight?: boolean }> = [
  { title: "Rainy Lantern Alley", place: "Jiufen Street", city: "Taipei", country: "Taiwan", lat: 25.1095, lng: 121.845, seed: 0, days: 3, is_highlight: true },
  { title: "Golden Hour on the Promenade", place: "Xinyi Waterfront", city: "Taipei", country: "Taiwan", lat: 25.033, lng: 121.565, seed: 1, days: 5, is_highlight: true },
  { title: "Morning Market Flow", place: "Raohe Night Market", city: "Taipei", country: "Taiwan", lat: 25.0507, lng: 121.577, seed: 2, days: 6 },
  { title: "Neon Rain Reflections", place: "Shibuya Crossing", city: "Tokyo", country: "Japan", lat: 35.6595, lng: 139.7005, seed: 3, days: 10, is_highlight: true },
  { title: "Slow Train Window", place: "Eno Line", city: "Kamakura", country: "Japan", lat: 35.3354, lng: 139.4901, seed: 4, days: 12 },
  { title: "Temple at First Light", place: "Senso-ji", city: "Tokyo", country: "Japan", lat: 35.7148, lng: 139.7967, seed: 5, days: 14 },
  { title: "The Coffee Pour", place: "Kafé Landet", city: "Stockholm", country: "Sweden", lat: 59.3175, lng: 18.0723, seed: 6, days: 20 },
  { title: "Winter Canal Crossings", place: "Gamla Stan", city: "Stockholm", country: "Sweden", lat: 59.3259, lng: 18.0711, seed: 7, days: 22 },
  { title: "Basilica Silhouette", place: "San Marco", city: "Venice", country: "Italy", lat: 45.4341, lng: 12.3387, seed: 0, days: 30, is_highlight: true },
  { title: "Gondola Row", place: "Grand Canal", city: "Venice", country: "Italy", lat: 45.4386, lng: 12.3266, seed: 1, days: 31 },
  { title: "Blue Hour Balcony", place: "Riad Omar", city: "Marrakech", country: "Morocco", lat: 31.6295, lng: -7.9811, seed: 2, days: 40 },
  { title: "Spice Market Shadows", place: "Jemaa el-Fnaa", city: "Marrakech", country: "Morocco", lat: 31.6258, lng: -7.9891, seed: 3, days: 41 },
  { title: "Coastal Drive Cut", place: "Amalfi Coast", city: "Positano", country: "Italy", lat: 40.6283, lng: 14.4845, seed: 4, days: 50 },
  { title: "First Coffee of the Week", place: "Home Studio", city: "Taipei", country: "Taiwan", lat: 25.05, lng: 121.549, seed: 5, days: 1 },
  { title: "Window Light Study", place: "Home Studio", city: "Taipei", country: "Taiwan", lat: 25.05, lng: 121.549, seed: 6, days: 2 },
  { title: "Night Walk Through Alley", place: "Yongkang Street", city: "Taipei", country: "Taiwan", lat: 25.0293, lng: 121.5266, seed: 7, days: 8 },
];

const MEMORIES: Memory[] = S.map((s, i) => ({
  id: `m${i}`,
  title: s.title,
  media_type: i % 3 === 0 ? "video" : "image",
  original_filename: `${s.title.toLowerCase().replace(/\s+/g, "-")}.${i % 3 === 0 ? "mov" : "jpg"}`,
  storage_key: `users/u1/originals/2026/${String(i).padStart(2, "0")}/u1.m${i}`,
  media_url: coverSvg(s.title, s.seed === 0 ? "PF" : s.city, s.seed + i),
  thumbnail_key: "",
  thumbnail: coverSvg(s.title, s.city, s.seed + i),
  mime_type: i % 3 === 0 ? "video/quicktime" : "image/jpeg",
  file_size: (i % 3 === 0 ? 18 + i : 1.2 + i * 0.4) * 1024 * 1024,
  width: 3840,
  height: 2160,
  duration_seconds: i % 3 === 0 ? 15 + i * 3 : null,
  captured_at: iso(s.days, 8 + (i % 12)),
  uploaded_at: iso(s.days, 20),
  location_name: s.place,
  city: s.city,
  country: s.country,
  latitude: s.lat,
  longitude: s.lng,
  notes: appearanceNotes(i) + " Filmed on a pocket camera.",
  device_name: "Pocket Camera",
  is_highlight: !!s.is_highlight,
  highlight_caption: s.is_highlight ? `A ${s.title.toLowerCase()} memory worth keeping.` : "",
  tags: sampleTags(i),
  project_id: i % 5 === 0 ? "p0" : i % 7 === 0 ? "p1" : null,
}));

function appearanceNotes(i: number): string {
  const a = ["Slow push-in.", "Handheld follow.", "Static wide.", "Orbit shot.", "Low-angle pass.", "Tracking pull."];
  return a[i % a.length];
}

function sampleTags(i: number): string[] {
  const all = ["golden-hour", "night", "street", "travel", "food", "urban", "nature", "neon", "b-roll"];
  const t = [all[i % all.length], all[(i + 3) % all.length]];
  return [...new Set(t)];
}

const PROJECTS: Project[] = [
  {
    id: "p0",
    title: "7 Days of Ordinary",
    description: "One small ordinary moment, filmed beautifully, every day for a week.",
    status: "active",
    due_date: iso(-14, 9),
    goal: "Capture the beauty of routine.",
    location: "Taipei",
    moodboard: ["warm", "peaceful", "close-up"],
    notes: "Keep shots under 10s. Focus on texture and light.",
    cover_memory_id: "m0",
    created_at: iso(20),
    shot_list: [
      { id: "s0", title: "Morning kettle", notes: "Steam backlit", completed: true, order_index: 0 },
      { id: "s1", title: "Window dust", notes: "Slow rack focus", completed: true, order_index: 1 },
      { id: "s2", title: "Coffee pour", notes: "Top-down macro", completed: false, order_index: 2 },
      { id: "s3", title: "Street crossing", notes: "Low angle", completed: false, order_index: 3 },
      { id: "s4", title: "Evening lamp", notes: "Warm flicker", completed: false, order_index: 4 },
    ],
  },
  {
    id: "p1",
    title: "One Place, One Minute",
    description: "A single breathtaking minute at one location.",
    status: "active",
    due_date: null,
    goal: "Paint a full mood board in 60 seconds.",
    location: "Amalfi Coast",
    moodboard: ["blue", "breathtaking", "slow"],
    notes: "Revisit the coastal drive cut.",
    cover_memory_id: "m12",
    created_at: iso(45),
    shot_list: [
      { id: "s5", title: "Wide establishing", notes: "cliff + sea", completed: false, order_index: 0 },
      { id: "s6", title: "Wave close-up", notes: "slow shutter", completed: false, order_index: 1 },
      { id: "s7", title: "Path POV walk", notes: "steadicam feel", completed: false, order_index: 2 },
    ],
  },
];

export function seedInspiration(): Inspiration[] {
  return INSP.map((i, idx) => ({ ...i, id: `i${idx}`, favorite: idx % 7 === 0 }));
}

const INSP: Omit<Inspiration, "favorite" | "id">[] = [
  { category: "Camera Movement", title: "The Slow Push-In", summary: "Push slowly toward your subject to build intimacy.", difficulty: "easy", locationTypes: ["indoor", "cafe"], moods: ["calm", "intimate"], durationRange: "5-15s", orientation: "both", movement: "push-in", shotList: ["Master wide", "Push-in medium", "Insert detail"], transition: "Hard cut to macro", soundIdea: "Room tone + light hum", editingTip: "Speed-ramp the final push to 80%." },
  { category: "Camera Movement", title: "One Location, Ten Angles", summary: "Shoot the same scene from ten different angles.", difficulty: "medium", locationTypes: ["any"], moods: ["playful", "observant"], durationRange: "10-20min", orientation: "both", movement: "mixed", shotList: ["High", "Low", "Hip level", "Dutch", "Over-shoulder", "Macro", "Reflection", "Shadow", "POV", "Extreme close"], transition: "Match cut", soundIdea: "One ambient loop", editingTip: "Cut on bounce rhythm." },
  { category: "Camera Movement", title: "Orbit Around a Subject", summary: "Circle your subject for a dynamic reveal.", difficulty: "medium", locationTypes: ["outdoor", "public"], moods: ["dynamic", "dramatic"], durationRange: "30-60s", orientation: "landscape", movement: "orbit", shotList: ["Wide orbit", "Close orbit", "Overhead"], transition: "Whip pan out", soundIdea: "Swelling score", editingTip: "Stabilize the orbit line." },
  { category: "Composition", title: "Light & Shadow Walk", summary: "A walk through strong light and shadow contrast.", difficulty: "easy", locationTypes: ["street", "urban"], moods: ["moody", "geometric"], durationRange: "5-10min", orientation: "vertical", movement: "walking", shotList: ["Shadow tunnel", "Sun flare", "Backlit silhouette", "Reflection puddle"], transition: "Shape match", soundIdea: "Footsteps + city", editingTip: "Expose for highlights." },
  { category: "Composition", title: "Frame Within a Frame", summary: "Use doors, windows, arches to frame subjects.", difficulty: "easy", locationTypes: ["travel", "street"], moods: ["thoughtful", "structured"], durationRange: "10-15min", orientation: "both", movement: "static + slow pan", shotList: ["Doorway wide", "Window close", "Arch silhouette"], transition: "Overlap dissolve", soundIdea: "Ambient", editingTip: "Line up edges precisely." },
  { category: "Camera Movement", title: "The Vertigo Dolly (DIY)", summary: "Zoom while moving for a disorienting effect.", difficulty: "hard", locationTypes: ["indoor"], moods: ["intense"], durationRange: "20-30s", orientation: "landscape", movement: "dolly + zoom", shotList: ["Wide approach", "Vertigo center", "Fast exit"], transition: "Hard cut", soundIdea: "Rising drone", editingTip: "Keep subject centered." },
  { category: "Transition", title: "Match Cut on Color", summary: "Cut between shots sharing one dominant color.", difficulty: "easy", locationTypes: ["any"], moods: ["playful", "artful"], durationRange: "5-8min", orientation: "both", movement: "mixed", shotList: ["5 color-matched pairs"], transition: "Straight cut", soundIdea: "Beat sync", editingTip: "Sort by hue mid-flow." },
  { category: "Transition", title: "Whip Pan Transition", summary: "End shots with a fast pan into the next.", difficulty: "medium", locationTypes: ["outdoor", "public"], moods: ["energetic"], durationRange: "10-15min", orientation: "landscape", movement: "whip pan", shotList: ["Set A pans left", "Match B pans left"], transition: "Whip pan", soundIdea: "Whoosh", editingTip: "Same direction always." },
  { category: "Story", title: "Morning to Night in One Place", summary: "Document a single place across a full day.", difficulty: "medium", locationTypes: ["any", "outdoor"], moods: ["narrative", "calm"], durationRange: "full day", orientation: "both", movement: "mixed", shotList: ["Dawn wide", "Morning detail", "Noon people", "Golden hour", "Blue hour", "Night"], transition: "Fade to time", soundIdea: "Day-long room tone", editingTip: "Watch the clock change." },
  { category: "Story", title: "The Five-Shot Sequence", summary: "Build a scene from just five disciplined shots.", difficulty: "easy", locationTypes: ["any"], moods: ["clean", "structured"], durationRange: "10-15min", orientation: "both", movement: "static mostly", shotList: ["Establishing", "Close-up", "Over-shoulder", "Detail insert", "Reverse"], transition: "J-cuts", soundIdea: "Natural audio", editingTip: "Hold each 4s." },
  { category: "Time of Day", title: "Golden Hour Ritual", summary: "Chase warm directional light before sunset.", difficulty: "easy", locationTypes: ["outdoor"], moods: ["warm", "romantic"], durationRange: "1 hour", orientation: "both", movement: "mixed", shotList: ["Sun low flare", "Backlit rim", "Long shadows", "Silhouette"], transition: "Soft cut", soundIdea: "Birds, breeze", editingTip: "Shoot in bursts." },
  { category: "Time of Day", title: "Night Walk", summary: "A cinematic night walk through lit streets.", difficulty: "medium", locationTypes: ["street", "urban"], moods: ["moody", "neon"], durationRange: "20-30min", orientation: "vertical", movement: "walking", shotList: ["Neon bokeh", "Rain reflections", "Lit shopfronts", "Headlight trails"], transition: "Blink cuts", soundIdea: "Bass + street", editingTip: "Use 4k 24fps for lights." },
  { category: "Travel", title: "Travel Day in 6 Shots", summary: "Capture a full travel day efficiently.", difficulty: "easy", locationTypes: ["travel"], moods: ["energetic", "authentic"], durationRange: "1 day", orientation: "both", movement: "mixed", shotList: ["Departure", "Transit window", "Arrival reveal", "Check-in detail", "First meal", "Evening walk"], transition: "Rhythmic cuts", soundIdea: "Vox pop + ambience", editingTip: "Log clips by scene." },
  { category: "Travel", title: "Train Window Poetry", summary: "Slow footage from a moving train window.", difficulty: "easy", locationTypes: ["travel", "train"], moods: ["dreamy", "contemplative"], durationRange: "20-40min", orientation: "landscape", movement: "static + pan", shotList: ["Rails ahead", "Side landscape", "Tunnel light flash", "Reflection"], transition: "Cross dissolve", soundIdea: "Rail, wind", editingTip: "Shoot through clean glass." },
  { category: "Indoor", title: "The Coffee Pour Study", summary: "Macro study of making one coffee.", difficulty: "easy", locationTypes: ["indoor"], moods: ["cozy", "detailed"], durationRange: "10-15min", orientation: "vertical", movement: "macro + top-down", shotList: ["Beans pour", "Steam", "Grind", "Bloom", "Pour", "Cup settle"], transition: "Match on steam", soundIdea: "Gas, drips, foley", editingTip: "Slow 60fps pours." },
  { category: "Indoor", title: "Window Light Study", summary: "One window, changing light through the morning.", difficulty: "easy", locationTypes: ["indoor"], moods: ["calm", "minimal"], durationRange: "2 hours", orientation: "both", movement: "static + slow pan", shotList: ["Wide room", "Shade shift", "Dust motes", "Rim on object"], transition: "Time lapse cuts", soundIdea: "Room tone", editingTip: "Timelapse the shift." },
  { category: "Food", title: "Food Story: One Dish", summary: "Tell a dish's story from raw to plated.", difficulty: "medium", locationTypes: ["indoor", "kitchen"], moods: ["appetizing", "warm"], durationRange: "30-45min", orientation: "vertical", movement: "macro + top-down", shotList: ["Ingredients", "Sizzle close", "Hands mixing", "Plating", "Final reveal"], transition: "Steam tension", soundIdea: "Crackle, chop", editingTip: "Shoot 60fps for sizzle." },
  { category: "Street", title: "Street Frames: Waiting", summary: "People waiting — real candid moments.", difficulty: "hard", locationTypes: ["street"], moods: ["honest", "documentary"], durationRange: "15-30min", orientation: "both", movement: "static", shotList: ["Bus stop", "Cafe table", "Crosswalk", "Kiosk"], transition: "Hard cuts", soundIdea: "Diegetic", editingTip: "Shoot discrete, be patient." },
  { category: "Street", title: "Rainy Neon Rain", summary: "Street in the rain with neon reflections.", difficulty: "medium", locationTypes: ["street", "urban"], moods: ["cinematic", "neon"], durationRange: "15-20min", orientation: "vertical", movement: "walking", shotList: ["Puddle mirror", "Neon close", "Umbrella silhouette", "Traffic trails"], transition: "Flip on reflection", soundIdea: "Rain + bass", editingTip: "Cover lens, use 4k." },
  { category: "B-Roll", title: "Cinematic B-Roll Pack", summary: "A grab-bag of premium b-roll clips.", difficulty: "medium", locationTypes: ["any"], moods: ["premium", "versatile"], durationRange: "20-40min", orientation: "both", movement: "mixed", shotList: ["Detail textures", "Slow pans", "Silhouettes", "Lens flare", "Shallow focus"], transition: "Match cuts", soundIdea: "Clean ambience", editingTip: "Lock exposure, shoot 60fps." },
  { category: "Challenge", title: "Beginner: One Day One Cut", summary: "A day captured as one continuous shot.", difficulty: "easy", locationTypes: ["any"], moods: ["authentic", "flow"], durationRange: "full day", orientation: "vertical", movement: "continuous", shotList: ["Morning", "Noon", "Evening segments"], transition: "Live cuts", soundIdea: "Full soundtrack", editingTip: "Segment into moments." },
  { category: "Challenge", title: "Beginner: Shadow Zoo", summary: "Find 5 animal shapes in shadows.", difficulty: "easy", locationTypes: ["indoor", "outdoor"], moods: ["playful"], durationRange: "10-15min", orientation: "both", movement: "static", shotList: ["5 shadow shapes"], transition: "Iris", soundIdea: "Playful", editingTip: "Contrast punch." },
  { category: "Challenge", title: "Three Second Rule", summary: "Every shot exactly three seconds.", difficulty: "medium", locationTypes: ["any"], moods: ["rhythmic", "fun"], durationRange: "10-20min", orientation: "both", movement: "one move each", shotList: ["20 three-second shots"], transition: "Beat cuts", soundIdea: "Metronome", editingTip: "Snap to beat." },
  { category: "Subject", title: "Hands at Work", summary: "Close-ups of hands doing skilled work.", difficulty: "easy", locationTypes: ["any"], moods: ["focused", "human"], durationRange: "15-25min", orientation: "both", movement: "macro + static", shotList: ["Tools", "Holding", "Repetition", "Finish"], transition: "Match on motion", soundIdea: "Tool sounds", editingTip: "Shoot 60fps slow." },
  { category: "Subject", title: "Reflections & Mirror World", summary: "Compose everything through reflections.", difficulty: "medium", locationTypes: ["street", "urban"], moods: ["abstract", "dreamy"], durationRange: "15-30min", orientation: "both", movement: "mixed", shotList: ["Puddle", "Shop window", "Car mirror", "Glass building"], transition: "Mirror match", soundIdea: "Ambient", editingTip: "Flip for readability." },
  { category: "Light", title: "Harsh Light Architecture", summary: "Shoot buildings under harsh noon light.", difficulty: "easy", locationTypes: ["urban"], moods: ["geometric", "modern"], durationRange: "30-60min", orientation: "landscape", movement: "static + tilt", shotList: ["Sunlit facade", "Hard shadows", "Glass grid", "Wide vertigo"], transition: "Flip", soundIdea: "City hum", editingTip: "Embrace the contrast." },
  { category: "Movement", title: "POV: Run Through Town", summary: "A run-through POV of an area.", difficulty: "medium", locationTypes: ["urban", "park"], moods: ["energetic"], durationRange: "10-15min", orientation: "landscape", movement: "running", shotList: ["Start", "Stride", "Street sweep", "Ending pause"], transition: "Cut on foot", soundIdea: "Breath + steps", editingTip: "Use gimbal lock." },
  { category: "Movement", title: "Subject Tracking", summary: "Follow a single subject across a scene.", difficulty: "medium", locationTypes: ["outdoor", "public"], moods: ["narrative"], durationRange: "10-20min", orientation: "both", movement: "tracking", shotList: ["Long follow", "Hip level", "Side weave"], transition: "Jump cut", soundIdea: "Ambient + steps", editingTip: "Keep subject framed." },
  { category: "Editing", title: "Sound Design First", summary: "Build a cut around a soundscape.", difficulty: "hard", locationTypes: ["any"], moods: ["immersive"], durationRange: "10-20min", orientation: "both", movement: "mixed", shotList: ["Record 10 foley clips", "Then match visuals"], transition: "Sound bridges", soundIdea: "The star", editingTip: "Craft audio before video." },
  { category: "Cinematic B-Roll", title: "Slow Motion Textures", summary: "Everything in slow motion for texture.", difficulty: "easy", locationTypes: ["any"], moods: ["premium", "sensual"], durationRange: "15-25min", orientation: "both", movement: "slow", shotList: ["Smoke, water, fabric, sand, light"], transition: "Dissolves", soundIdea: "Soft pad", editingTip: "Shoot 120fps." },
  { category: "Story", title: "A Stranger's Day", summary: "Document an anonymous day through hands.", difficulty: "hard", locationTypes: ["public"], moods: ["empathic", "mysterious"], durationRange: "1-2 hours", orientation: "both", movement: "mixed", shotList: ["Door", "Hands", "Route", "Seat", "Exit"], transition: "Match on hands", soundIdea: "Diegetic", editingTip: "Consent + respect." },
  { category: "Time of Day", title: "Blue Hour Boulevards", summary: "Shoot streets in the blue hour.", difficulty: "easy", locationTypes: ["street", "urban"], moods: ["calm", "cinematic"], durationRange: "30-40min", orientation: "both", movement: "static + slow", shotList: ["Sky gradient", "Lit windows", "Car trails", "Street lamps"], transition: "Fade", soundIdea: "Distant traffic", editingTip: "Balance tungsten/ambient." },
];

export function seedMemories(): Memory[] {
  return MEMORIES;
}

export function seedProjects(): Project[] {
  return PROJECTS;
}
