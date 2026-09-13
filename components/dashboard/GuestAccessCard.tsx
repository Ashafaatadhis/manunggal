"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GuestAccessCardProps {
  slug: string;
}

export default function GuestAccessCard({ slug }: GuestAccessCardProps) {
  const [guestUrl, setGuestUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/g/${slug}`;

    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        setGuestUrl(url);
        setQrCode(dataUrl);
      })
      .catch(() => setError("QR code gagal dibuat. Coba lagi."))
      .finally(() => setIsLoading(false));
  }, [slug]);

  async function copyGuestUrl() {
    try {
      await navigator.clipboard.writeText(guestUrl);
      setIsCopied(true);
      setActionError("");
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setActionError("Link gagal disalin. Salin URL secara manual.");
    }
  }

  function downloadQrCode() {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = `manunggal-${slug}-qr.png`;
    link.href = qrCode;
    link.click();
    setActionError("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Link dan QR tamu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                 Tamu dapat scan QR ini untuk mengunggah foto dan ucapan.
              </p>
              <code className="mt-3 block break-all rounded bg-muted p-3 text-sm">
                {guestUrl || `manunggal.com/g/${slug}`}
              </code>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyGuestUrl} disabled={!guestUrl}>
                 {isCopied ? "Link tersalin" : "Salin link"}
              </Button>
              <Button size="sm" onClick={downloadQrCode} disabled={!qrCode}>
                 Unduh QR
              </Button>
            </div>
            {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
          </div>
          <div className="flex min-h-52 items-center justify-center rounded-lg border bg-white p-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Membuat QR...</p>
            ) : error ? (
              <p className="text-center text-sm text-destructive">{error}</p>
            ) : (
              <img
                src={qrCode}
                alt={`QR code untuk ${guestUrl}`}
                width={192}
                height={192}
                className="h-48 w-48"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
