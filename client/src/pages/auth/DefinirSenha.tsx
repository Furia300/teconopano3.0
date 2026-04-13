import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Check } from "lucide-react";
import { toast } from "sonner";

export default function DefinirSenha() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) return toast.error("Senha deve ter pelo menos 4 caracteres");
    if (password !== confirm) return toast.error("Senhas não conferem");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDone(true);
      toast.success("Senha definida com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao definir senha");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-center text-white/50">Link inválido ou expirado.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
      <div
        style={{
          width: 400,
          background: "rgba(26,26,26,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "40px 32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(0,198,76,0.15)" }}>
              <Check size={32} color="#00C64C" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Senha definida!</h2>
            <p className="text-white/50 text-sm mb-6">Agora você pode fazer login com sua nova senha.</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ background: "linear-gradient(135deg, #FF073A, #B20028)", cursor: "pointer", border: "none" }}
            >
              Ir para Login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,7,58,0.12)" }}>
                <Lock size={24} color="#FF073A" />
              </div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Saira Expanded', sans-serif" }}>
                Definir Senha
              </h2>
              <p className="text-white/45 text-sm mt-1">Crie uma senha para acessar o sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Nova Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                  placeholder="Mínimo 4 caracteres"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Confirmar Senha</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-white text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                  placeholder="Repita a senha"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold mt-2"
                style={{
                  background: loading ? "#3f3f46" : "linear-gradient(135deg, #FF073A, #B20028)",
                  cursor: loading ? "not-allowed" : "pointer",
                  border: "none",
                  boxShadow: loading ? "none" : "0 4px 15px rgba(255,7,58,0.3)",
                }}
              >
                {loading ? "Salvando..." : "Definir Senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
