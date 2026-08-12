// Media upload via Cloudinary (25 GB free, no credit card).
// Upload uses an unsigned preset + public cloud name.

export function isMediaCloudEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD && !!process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
}

export function cloudinaryConfig() {
  return {
    cloud: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || "",
    preset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "",
  };
}

export async function createUploadPaths(key: string, originalFilename: string, ext: string): Promise<{ original: string; thumbnail: string }> {
  const ym = new Date().toISOString().slice(0, 7);
  const base = `${ym}/${key}-${sanitize(originalFilename)}`;
  const original = `pocketframe/${base}.${ext}`;
  const thumbnail = `pocketframe/${base}.webp`;
  return { original, thumbnail };
}

export async function uploadMediaBlob(blob: Blob, folder: string, resourceType: "image" | "video"): Promise<string> {
  const { cloud, preset } = cloudinaryConfig();
  const fd = new FormData();
  fd.append("file", blob);
  fd.append("upload_preset", preset);
  if (folder) fd.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json();
  return json.secure_url as string;
}

export async function uploadMediaBlobProgress(
  blob: Blob,
  folder: string,
  resourceType: "image" | "video",
  onProgress?: (pct: number) => void
): Promise<string> {
  const { cloud, preset } = cloudinaryConfig();
  return await new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).secure_url as string);
        } catch {
          reject(new Error("Upload failed"));
        }
      } else {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    const fd = new FormData();
    fd.append("file", blob);
    fd.append("upload_preset", preset);
    if (folder) fd.append("folder", folder);
    xhr.send(fd);
  });
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 60);
}