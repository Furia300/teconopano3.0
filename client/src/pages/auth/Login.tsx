import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@tecnopano.com');
  const [password, setPassword] = useState('admin');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorMethod, setTwoFactorMethod] = useState<'sms' | 'app'>('app');
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAMethods, setTwoFAMethods] = useState<{ sms: boolean; app: boolean }>({ sms: false, app: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(
        email, 
        password, 
        show2FA ? twoFactorCode : undefined,
        show2FA ? twoFactorMethod : undefined
      );
      // Success handled in useAuth
    } catch (error: any) {
      if (error.response?.data?.requires2FA) {
        setTwoFAMethods(error.response.data.methods || { sms: false, app: false });
        setShow2FA(true);
        if (error.response.data.methods?.app) {
          setTwoFactorMethod('app');
        } else if (error.response.data.methods?.sms) {
          setTwoFactorMethod('sms');
        }
        toast.error('Código 2FA necessário');
      } else {
        const errorMsg = error.message || 'Erro ao fazer login';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img src="/src/assets/logo.png" alt="Logo" className="w-80 h-auto mb-6" />
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock className="w-4 h-4" />
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              disabled={loading}
            />
          </div>

          {/* 2FA Section */}
          {show2FA && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              {(twoFAMethods.sms || twoFAMethods.app) && (
                <div>
                  <label className="form-label">
                    <Shield className="w-4 h-4" />
                    Método de Autenticação:
                  </label>
                  <div className="flex gap-3">
                    {twoFAMethods.app && (
                      <button
                        type="button"
                        onClick={() => setTwoFactorMethod('app')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                          twoFactorMethod === 'app'
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
                        }`}
                      >
                        App Autenticador
                      </button>
                    )}
                    {twoFAMethods.sms && (
                      <button
                        type="button"
                        onClick={() => setTwoFactorMethod('sms')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                          twoFactorMethod === 'sms'
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
                        }`}
                      >
                        SMS
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">
                  <Shield className="w-4 h-4" />
                  {twoFactorMethod === 'sms' ? 'Código SMS' : 'Código do App Autenticador'}
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="form-input"
                  maxLength={6}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-login"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            <Shield className="w-3 h-3" />
            Sistema seguro com autenticação de dois fatores
          </p>
        </div>
      </div>
    </div>
  );
}
