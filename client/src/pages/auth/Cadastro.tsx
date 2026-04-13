import { useState } from "react";
import { useLocation } from "wouter";
import { UserPlus, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Cadastro() {
  const [, navigate] = useLocation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargo, setCargo] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !password.trim()) {
      return toast.error("Preencha todos os campos obrigatórios");
    }
    if (password.length < 4) return toast.error("Senha deve ter pelo menos 4 caracteres");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), password, cargo: cargo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDone(true);
      toast.success("Cadastro realizado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
      <div
        style={{
          width: 420,
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
            <h2 className="text-xl font-bold text-white mb-2">Cadastro Enviado!</h2>
            <p className="text-white/50 text-sm mb-2">
              Seu cadastro foi recebido e está aguardando aprovação do administrador.
            </p>
            <p className="text-white/30 text-xs mb-6">
              Você receberá acesso assim que for aprovado.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ background: "linear-gradient(135deg, #FF073A, #B20028)", cursor: "pointer", border: "none" }}
            >
              Voltar ao Login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,7,58,0.12)" }}>
                <UserPlus size={24} color="#FF073A" />
              </div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Saira Expanded', sans-serif" }}>
                Solicitar Acesso
              </h2>
              <p className="text-white/45 text-sm mt-1">Cadastre-se e aguarde aprovação</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Nome completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Senha *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                  placeholder="Mínimo 4 caracteres"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Cargo (opcional)</label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
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
                {loading ? "Enviando..." : "Solicitar Acesso"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-2 text-white/40 text-sm flex items-center justify-center gap-1 hover:text-white/60 transition-colors"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <ArrowLeft size={14} /> Voltar ao login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
