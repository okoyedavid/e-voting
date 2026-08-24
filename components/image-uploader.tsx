"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";

type ImageUploaderProps = {
  entityType: "event" | "category" | "contestant";
  entityId: string;
  label: string;
  currentImage?: string | null;
  aspect?: "cover" | "portrait";
  compact?: boolean;
};

export function ImageUploader({ entityType, entityId, label, currentImage, aspect = "cover", compact = false }: ImageUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [savedImage, setSavedImage] = useState(currentImage ?? null);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "uploading" | "removing" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function chooseFile(nextFile?: File) {
    if (!nextFile) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(nextFile.type) || nextFile.size > 5 * 1024 * 1024) {
      setMessage("Choose a JPEG, PNG or WebP image smaller than 5 MB.");
      setState("error");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setMessage("");
    setState("idle");
  }

  function upload() {
    if (!file) return;
    setState("uploading"); setProgress(0); setMessage("");
    const body = new FormData();
    body.set("file", file); body.set("entityType", entityType); body.set("entityId", entityId);
    const request = new XMLHttpRequest();
    request.open("POST", "/api/uploads/images");
    request.upload.onprogress = (event) => event.lengthComputable && setProgress(Math.round((event.loaded / event.total) * 100));
    request.onerror = () => { setState("error"); setMessage("Upload failed. Check your connection and try again."); };
    request.onload = () => {
      const response = JSON.parse(request.responseText || "{}");
      if (request.status < 200 || request.status >= 300) { setState("error"); setMessage(response.error || "Image upload failed."); return; }
      setSavedImage(response.image.deliveryUrl); setFile(null); setPreview(null); setState("idle"); setProgress(100); setMessage("Image saved successfully."); router.refresh();
    };
    request.send(body);
  }

  async function remove() {
    if (!savedImage || !window.confirm(`Remove this ${label.toLowerCase()}?`)) return;
    setState("removing"); setMessage("");
    const response = await fetch("/api/uploads/images", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entityType, entityId }) });
    const result = await response.json();
    if (!response.ok) { setState("error"); setMessage(result.error || "Image could not be removed."); return; }
    setSavedImage(null); setState("idle"); setMessage(result.cleanupWarning ? "Image removed; remote cleanup will be retried." : "Image removed."); router.refresh();
  }

  const displayedImage = preview ?? savedImage;
  return <div className={`image-uploader ${compact ? "image-uploader-compact" : ""}`}>
    <div className={`upload-preview upload-preview-${aspect}`} onClick={() => state === "idle" && inputRef.current?.click()}>
      {displayedImage ? <Image src={displayedImage} alt={`${label} preview`} fill unoptimized={Boolean(preview)} sizes={compact ? "160px" : "(max-width: 700px) 100vw, 500px"} /> : <span><ImagePlus size={24} /><b>Add {label.toLowerCase()}</b><small>JPEG, PNG or WebP · max 5 MB</small></span>}
      {state === "uploading" && <span className="upload-overlay"><LoaderCircle className="spin" /><b>Uploading {progress}%</b><i><em style={{ width: `${progress}%` }} /></i></span>}
    </div>
    <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseFile(event.target.files?.[0])} />
    <div className="upload-actions">
      {file ? <><button type="button" className="button button-primary button-sm" disabled={state === "uploading"} onClick={upload}><UploadCloud size={15} /> Upload image</button><button type="button" className="button button-secondary button-sm" onClick={() => { setFile(null); setPreview(null); }}><X size={15} /> Cancel</button></> : <button type="button" className="button button-secondary button-sm" disabled={state !== "idle"} onClick={() => inputRef.current?.click()}>{savedImage ? <><RefreshCw size={14} /> Replace</> : <><ImagePlus size={14} /> Choose image</>}</button>}
      {savedImage && !file && <button type="button" className="icon-danger" disabled={state !== "idle"} onClick={remove}>{state === "removing" ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={15} />} Remove</button>}
    </div>
    {message && <p className={state === "error" ? "upload-message error-text" : "upload-message success-text"} aria-live="polite">{message}</p>}
  </div>;
}
