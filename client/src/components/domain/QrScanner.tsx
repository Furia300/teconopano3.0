import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, CameraOff, Keyboard, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QrScannerProps {
  onScan: (code: string) => void;
  placeholder?: string;
  scanning?: boolean;
}

/**
 * Componente de leitura QR Code com duas opções:
 * 1. Câmera do tablet/celular (html5-qrcode)
 * 2. Input manual / pistola scanner (teclado)
 */
export function QrScanner({ onScan, placeholder = "Código QR (ex: TN-XXXXX)", scanning = false }: QrScannerProps) {
  const [mode, setMode] = useState<"input" | "camera">("input");
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input
  useEffect(() => {
    if (mode === "input" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  // Camera scanner
  useEffect(() => {
    if (mode !== "camera") return;

    let scanner: any = null;

    const startCamera = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const containerId = "qr-reader-" + Math.random().toString(36).slice(2);

        if (containerRef.current) {
          containerRef.current.id = containerId;
        }

        scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText: string) => {
            // QR lido com sucesso
            onScan(decodedText);
            // Parar scanner após leitura
            try { scanner.stop(); } catch {}
            setMode("input");
          },
          () => {
            // Scan em andamento (sem resultado ainda)
          }
        );

        setCameraReady(true);
        setCameraError("");
      } catch (err: any) {
        console.error("Camera error:", err);
        setCameraError(
          err?.message?.includes("NotAllowedError")
            ? "Permissão de câmera negada. Permita o acesso nas configurações do navegador."
            : err?.message?.includes("NotFoundError")
            ? "Nenhuma câmera encontrada neste dispositivo."
            : "Erro ao acessar a câmera. Tente o modo manual."
        );
        setCameraReady(false);
      }
    };

    startCamera();

    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
        scannerRef.current = null;
      }
      setCameraReady(false);
    };
  }, [mode, onScan]);

  const handleManualSubmit = useCallback(() => {
    const code = manualCode.trim();
    if (code) {
      onScan(code);
      setManualCode("");
    }
  }, [manualCode, onScan]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleManualSubmit();
    }
  }, [handleManualSubmit]);

  return (
    <div className="space-y-3">
      {/* Toggle mode */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={mode === "input" ? "default" : "secondary"}
          size="sm"
          onClick={() => setMode("input")}
          className="gap-1.5 text-[11px]"
        >
          <Keyboard className="h-3.5 w-3.5" />
          Digitar / Scanner
        </Button>
        <Button
          type="button"
          variant={mode === "camera" ? "default" : "secondary"}
          size="sm"
          onClick={() => setMode("camera")}
          className="gap-1.5 text-[11px]"
        >
          <Camera className="h-3.5 w-3.5" />
          Câmera
        </Button>
      </div>

      {/* Mode: Manual input / barcode scanner */}
      {mode === "input" && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fips-fg-muted)]" />
            <Input
              ref={inputRef}
              density="compact"
              className="pl-9 font-mono text-[13px]"
              placeholder={placeholder}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={scanning}
            />
          </div>
          <Button
            type="button"
            onClick={handleManualSubmit}
            disabled={!manualCode.trim() || scanning}
            className="gap-1.5"
            size="sm"
          >
            {scanning ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      )}

      {/* Mode: Camera */}
      {mode === "camera" && (
        <div className="rounded-xl border-2 border-dashed border-[var(--fips-primary)] overflow-hidden bg-black">
          {cameraError ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <CameraOff className="h-8 w-8 text-[var(--fips-danger)]" />
              <p className="text-[12px] text-white/80">{cameraError}</p>
              <Button variant="secondary" size="sm" onClick={() => setMode("input")}>
                Usar modo manual
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div
                ref={containerRef}
                style={{ width: "100%", minHeight: 280 }}
              />
              {!cameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <p className="text-[11px] text-white/70">Iniciando câmera...</p>
                </div>
              )}
              {cameraReady && (
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold text-white">
                    Aponte para o QR Code
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-[9px] text-[var(--fips-fg-muted)] text-center">
        {mode === "input"
          ? "Use a pistola scanner ou digite o código manualmente"
          : "Posicione o QR Code dentro da área de leitura"}
      </p>
    </div>
  );
}
