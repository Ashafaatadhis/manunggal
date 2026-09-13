"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas-pro";
import { Download, ImagePlus, Link2, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getSignageFilename,
  QR_THEMES,
  SIGNAGE_TEMPLATES,
  type QrColorPreset,
  type SignageTemplate,
} from "@/lib/signage";
import type { Event } from "@/lib/types";

function ThemeOrnaments({
  theme,
  compact = false,
}: {
  theme: "floral" | "birthday";
  compact?: boolean;
}) {
  if (theme === "floral") {
    return (
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          className="hidden"
          viewBox="0 0 420 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 10C80 36 115 12 175 30C245 51 300 8 420 22"
            stroke="#78957d"
            strokeWidth="2"
            opacity=".55"
          />
          <path
            d="M20 22C32 4 47 5 51 24C44 37 29 37 20 22ZM69 27C83 10 98 15 96 33C86 43 74 39 69 27ZM142 30C153 12 169 13 172 31C163 43 150 42 142 30ZM238 27C250 9 266 12 270 29C259 42 245 40 238 27ZM319 24C332 5 348 10 350 27C341 39 326 37 319 24Z"
            fill="#d98da6"
          />
          <path
            d="M10 35C34 48 40 63 35 82C19 75 12 58 10 35ZM105 30C127 44 132 59 123 77C108 68 103 51 105 30ZM190 38C214 47 222 62 216 82C199 75 191 59 190 38ZM283 32C305 42 313 58 305 78C290 70 283 53 283 32ZM373 30C398 40 406 57 399 77C383 70 375 53 373 30Z"
            fill="#a9c5a8"
            opacity=".9"
          />
          <circle cx="35" cy="18" r="13" fill="#f4c7d5" />
          <circle cx="35" cy="18" r="5" fill="#d78aa5" />
          <circle cx="160" cy="25" r="15" fill="#f7d9df" />
          <circle cx="160" cy="25" r="6" fill="#d78aa5" />
          <circle cx="255" cy="22" r="14" fill="#f4c7d5" />
          <circle cx="255" cy="22" r="5" fill="#d78aa5" />
          <circle cx="338" cy="17" r="15" fill="#f7d9df" />
          <circle cx="338" cy="17" r="6" fill="#d78aa5" />
        </svg>
        <svg
          className="hidden"
          viewBox="0 0 420 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 10C80 36 115 12 175 30C245 51 300 8 420 22"
            stroke="#78957d"
            strokeWidth="2"
            opacity=".55"
          />
          <path
            d="M20 22C32 4 47 5 51 24C44 37 29 37 20 22ZM69 27C83 10 98 15 96 33C86 43 74 39 69 27ZM142 30C153 12 169 13 172 31C163 43 150 42 142 30ZM238 27C250 9 266 12 270 29C259 42 245 40 238 27ZM319 24C332 5 348 10 350 27C341 39 326 37 319 24Z"
            fill="#d98da6"
          />
          <path
            d="M10 35C34 48 40 63 35 82C19 75 12 58 10 35ZM105 30C127 44 132 59 123 77C108 68 103 51 105 30ZM190 38C214 47 222 62 216 82C199 75 191 59 190 38ZM283 32C305 42 313 58 305 78C290 70 283 53 283 32ZM373 30C398 40 406 57 399 77C383 70 375 53 373 30Z"
            fill="#a9c5a8"
            opacity=".9"
          />
          <circle cx="35" cy="18" r="13" fill="#f4c7d5" />
          <circle cx="35" cy="18" r="5" fill="#d78aa5" />
          <circle cx="160" cy="25" r="15" fill="#f7d9df" />
          <circle cx="160" cy="25" r="6" fill="#d78aa5" />
          <circle cx="255" cy="22" r="14" fill="#f4c7d5" />
          <circle cx="255" cy="22" r="5" fill="#d78aa5" />
          <circle cx="338" cy="17" r="15" fill="#f7d9df" />
          <circle cx="338" cy="17" r="6" fill="#d78aa5" />
        </svg>
        <img
          src="/flower1.png"
          alt=""
          className={`absolute inset-x-0 top-0 w-full object-cover object-bottom ${compact ? "h-24" : "h-32"}`}
        />
        <img
          src="/flower2.png"
          alt=""
          className={`absolute inset-x-0 bottom-0 w-full object-cover object-top ${compact ? "h-20" : "h-28"}`}
        />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute -right-4 -top-4 size-32"
        viewBox="0 0 120 120"
        fill="none"
      >
        <path
          d="M35 35L18 10M70 25L77 4M93 52L115 42M43 72L23 95M77 75L94 101"
          stroke="#f3b45e"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M48 45C38 34 40 20 52 17C64 20 65 35 56 46Z" fill="#f28d9b" />
        <path d="M49 45C58 34 70 35 74 45C70 56 57 57 49 49Z" fill="#f6c85f" />
        <path d="M49 47C43 59 30 61 24 52C26 40 39 38 49 47Z" fill="#7bc6d6" />
        <circle cx="51" cy="46" r="6" fill="#fff4d6" />
      </svg>
      <svg
        className="absolute -bottom-5 -left-5 size-32 rotate-180"
        viewBox="0 0 120 120"
        fill="none"
      >
        <path
          d="M35 35L18 10M70 25L77 4M93 52L115 42M43 72L23 95M77 75L94 101"
          stroke="#f3b45e"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M48 45C38 34 40 20 52 17C64 20 65 35 56 46Z" fill="#f28d9b" />
        <path d="M49 45C58 34 70 35 74 45C70 56 57 57 49 49Z" fill="#f6c85f" />
        <path d="M49 47C43 59 30 61 24 52C26 40 39 38 49 47Z" fill="#7bc6d6" />
        <circle cx="51" cy="46" r="6" fill="#fff4d6" />
      </svg>
    </div>
  );
}

interface SignagePanelProps {
  eventTitle: string;
  eventType?: Event["eventType"];
  eventId?: string;
  slug: string;
  initialColorPreset?: QrColorPreset;
  initialLogoUrl?: string;
  onSave?: (branding: {
    colorPreset: QrColorPreset;
    logoUrl: string | null;
  }) => Promise<void>;
}

export default function SignagePanel({
  eventTitle,
  eventType: _eventType = "other",
  eventId,
  slug,
  initialColorPreset = "ink",
  initialLogoUrl = "",
  onSave,
}: SignagePanelProps) {
  const safeColorPreset: QrColorPreset =
    initialColorPreset === "forest"
      ? "birthday"
      : initialColorPreset === "blush" || initialColorPreset === "ink"
        ? "floral"
        : initialColorPreset === "birthday" || initialColorPreset === "floral"
          ? initialColorPreset
          : "floral";
  const [template, setTemplate] = useState<SignageTemplate>("A4");
  const [colorPreset, setColorPreset] =
    useState<QrColorPreset>(safeColorPreset);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [qrCode, setQrCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [logoInput, setLogoInput] = useState(initialLogoUrl);
  const [logoError, setLogoError] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const signagePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = `${window.location.origin}/g/${slug}`;
    const colors = QR_THEMES[colorPreset];
    QRCode.toDataURL(url, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: colors.dark, light: colors.light },
    })
      .then(setQrCode)
      .catch(() => setQrCode(""));
  }, [colorPreset, slug]);

  async function saveCustomization() {
    if (!onSave) return;
    setIsSaving(true);
    setSaveMessage("");
    try {
      await onSave({ colorPreset, logoUrl: logoUrl || null });
      setSaveMessage("Tersimpan");
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Gagal menyimpan kustomisasi",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function useLogoUrl() {
    try {
      const url = new URL(logoInput.trim());
      if (!/^https?:$/.test(url.protocol)) throw new Error();
      setLogoUrl(url.toString());
      setLogoError("");
      setIsLogoDialogOpen(false);
    } catch {
      setLogoError("Masukkan URL gambar yang valid.");
    }
  }

  async function uploadLogo(file: File) {
    if (!eventId) {
      setLogoError("Upload logo belum tersedia untuk event ini.");
      return;
    }

    setIsUploadingLogo(true);
    setLogoError("");
    try {
      const signatureResponse = await fetch(
        `/api/events/${eventId}/logo-signature`,
      );
      const signatureData = await signatureResponse.json();
      if (!signatureResponse.ok || !signatureData.success) {
        throw new Error(
          signatureData.error?.message || "Gagal menyiapkan upload logo.",
        );
      }

      const { timestamp, signature, apiKey, cloudName, folder } =
        signatureData.data;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error("Logo gagal diunggah.");
      }

      setLogoUrl(uploadData.secure_url);
      setLogoInput(uploadData.secure_url);
      setIsLogoDialogOpen(false);
    } catch (error) {
      setLogoError(
        error instanceof Error ? error.message : "Logo gagal diunggah.",
      );
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function downloadSignage() {
    if (!qrCode || !signagePreviewRef.current) return;
    try {
      let logoDataUrl = "";
      if (logoUrl) {
        try {
          const response = await fetch(logoUrl, { mode: "cors" });
          if (!response.ok) throw new Error("Logo request failed");
          const blob = await response.blob();
          logoDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          logoDataUrl = "";
        }
      }

      const canvas = await html2canvas(signagePreviewRef.current, {
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        scale: 2,
        logging: false,
        onclone: (clonedDocument) => {
          const logo = clonedDocument.querySelector<HTMLImageElement>(
            'img[alt="Logo event"]',
          );
          if (logoDataUrl && logo) {
            logo.removeAttribute("crossorigin");
            logo.src = logoDataUrl;
          } else if (logo) {
            logo.remove();
          }
        },
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.download = getSignageFilename(slug, template).replace(".pdf", ".png");
        link.href = URL.createObjectURL(blob);
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }, "image/png");
    } catch (error) {
      console.error("Download QR failed", error);
      setSaveMessage(
        error instanceof Error ? `Gagal mengunduh QR: ${error.message}` : "Gagal mengunduh QR",
      );
    }
  }

  const selectedTemplate = SIGNAGE_TEMPLATES[template];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg">QR Signage</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih ukuran, simpan pengaturan, atau unduh signage sebagai PNG.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void downloadSignage()} disabled={!qrCode}>
            <Download data-icon="inline-start" aria-hidden="true" />
            Download QR
          </Button>
          {onSave && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void saveCustomization()}
              disabled={isSaving}
            >
              <Save data-icon="inline-start" aria-hidden="true" />
              {isSaving ? "Menyimpan..." : "Simpan pengaturan"}
            </Button>
          )}
        </div>
      </CardHeader>
      {saveMessage && (
        <p className="px-6 text-sm text-muted-foreground" role="status">
          {saveMessage}
        </p>
      )}
      <CardContent className="space-y-5">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Signage template"
        >
          {(Object.keys(SIGNAGE_TEMPLATES) as SignageTemplate[]).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={template === key ? "default" : "outline"}
              aria-pressed={template === key}
              onClick={() => setTemplate(key)}
            >
              {SIGNAGE_TEMPLATES[key].label}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="flex flex-col gap-2 text-sm font-medium">
            <legend>Theme signage</legend>
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Theme signage"
            >
              {(["floral", "birthday"] as const).map((theme) => {
                const option = QR_THEMES[theme];
                const selected =
                  colorPreset === theme ||
                  (theme === "floral" &&
                    ["ink", "blush"].includes(colorPreset)) ||
                  (theme === "birthday" && colorPreset === "forest");
                return (
                  <button
                    key={theme}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setColorPreset(theme)}
                    className={`rounded-xl border p-3 text-left transition ${selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
                  >
                    <span
                      className={`mb-2 block h-8 rounded-lg ${option.accentClass}`}
                    />
                    <span className="block font-semibold">{option.label}</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="flex flex-col gap-2 text-sm font-medium">
            <span>Logo event (opsional)</span>
            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => setIsLogoDialogOpen(true)}
            >
              <ImagePlus data-icon="inline-start" aria-hidden="true" />
              {logoUrl ? "Ganti logo" : "Tambahkan logo"}
            </Button>
            {logoUrl && (
              <p className="truncate text-xs font-normal text-muted-foreground">
                Logo sudah dipilih.
              </p>
            )}
          </div>
        </div>

        <div
          ref={signagePreviewRef}
          className={`signage-preview relative mx-auto flex w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-lg border p-8 text-center text-gray-900 shadow-sm ${QR_THEMES[colorPreset].previewClass} ${QR_THEMES[colorPreset].patternClass} ${selectedTemplate.className}`}
          data-template={template}
          data-theme={colorPreset}
          data-filename={getSignageFilename(slug, template)}
        >
          <ThemeOrnaments
            compact={template !== "A4"}
            theme={
              colorPreset === "birthday" || colorPreset === "forest"
                ? "birthday"
                : "floral"
            }
          />
          <div className="relative z-10 flex w-full flex-col items-center justify-center gap-5 text-center">
            <p className="self-center text-center font-heading text-4xl italic tracking-tight text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
              {colorPreset === "birthday"
                ? "Let's celebrate"
                : "Share the love"}
            </p>
            {qrCode ? (
              <div className="relative mx-auto w-3/5 max-w-56 self-center rounded-xl bg-white p-3">
                <img
                  src={qrCode}
                  alt={`QR code ${eventTitle}`}
                  className="block w-full bg-white"
                />
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo event"
                    crossOrigin="anonymous"
                    className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-md border-4 border-white bg-white object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="flex aspect-square w-3/5 max-w-56 items-center justify-center bg-gray-100 text-sm text-gray-500">
                Membuat QR...
              </div>
            )}
            <p className="mx-auto w-fit max-w-full self-center break-all rounded bg-white/90 px-2 py-1 text-center text-xs font-medium text-[#334155]">
              manunggal.com/g/{slug}
            </p>
          </div>
        </div>
      </CardContent>
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambahkan logo event</DialogTitle>
            <DialogDescription>
              Ambil file logo dari perangkat atau gunakan URL gambar publik.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => logoFileInputRef.current?.click()}
              disabled={isUploadingLogo}
            >
              <Upload data-icon="inline-start" aria-hidden="true" />
              {isUploadingLogo ? "Mengunggah..." : "Pilih foto dari perangkat"}
            </Button>
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadLogo(file);
                event.target.value = "";
              }}
            />
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              atau lewat URL
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="flex gap-2">
              <Input
                type="url"
                aria-label="URL logo"
                placeholder="https://.../logo.png"
                value={logoInput}
                onChange={(event) => setLogoInput(event.target.value)}
              />
              <Button type="button" onClick={useLogoUrl}>
                <Link2 data-icon="inline-start" aria-hidden="true" />
                Pakai URL
              </Button>
            </div>
            {logoError && (
              <p className="text-sm text-destructive" role="alert">
                {logoError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogoDialogOpen(false)}
            >
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
