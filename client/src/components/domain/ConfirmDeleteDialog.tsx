import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmar exclusão",
  description = "Tem certeza que deseja excluir? Esta ação é permanente e não pode ser desfeita.",
}: ConfirmDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(220,38,38,0.1)" }}>
              <AlertTriangle className="h-5 w-5" style={{ color: "#DC2626" }} />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 rounded-lg p-3" style={{
          background: "rgba(220,38,38,0.04)",
          border: "1px solid rgba(220,38,38,0.15)",
        }}>
          <p className="text-[11px] font-semibold" style={{ color: "#DC2626" }}>
            Esta ação não pode ser desfeita. Os dados serão perdidos permanentemente.
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            loading={loading}
            className="gap-2"
            style={{ background: "#DC2626" }}
          >
            <AlertTriangle className="h-4 w-4" />
            Excluir permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook para usar o ConfirmDeleteDialog de forma simples.
 * Retorna [dialogElement, openConfirm] — renderize o dialogElement no JSX.
 */
export function useConfirmDelete() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const openConfirm = (opts: {
    title?: string;
    description?: string;
    onConfirm: () => void | Promise<void>;
  }) => {
    setState({
      open: true,
      title: opts.title || "Confirmar exclusão",
      description: opts.description || "Tem certeza que deseja excluir? Esta ação é permanente e não pode ser desfeita.",
      onConfirm: opts.onConfirm,
    });
  };

  const dialog = (
    <ConfirmDeleteDialog
      open={state.open}
      onOpenChange={(v) => setState((s) => ({ ...s, open: v }))}
      onConfirm={state.onConfirm}
      title={state.title}
      description={state.description}
    />
  );

  return [dialog, openConfirm] as const;
}
