import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MeshGradient } from '@paper-design/shaders-react';
import { Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Senha deve ter no mínimo 4 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Credenciais inválidas. Tente novamente.';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Efeito de fundo WebGL - MeshGradient preto/cinza/branco */}
      <div className="login-bg-effect">
        <MeshGradient
          className="login-mesh-gradient"
          colors={['#000000', '#1a1a1a', '#333333', '#ffffff']}
          speed={1.0}
          backgroundColor="#000000"
        />
      </div>

      {/* Card de Login com Glassmorphism */}
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <img src="/src/assets/logo.png" alt="Tecnopano" className="login-logo-img" />
          </div>
          <h1 className="login-title">Bem-vindo de volta</h1>
          <p className="login-subtitle">Sistema de Gestão Industrial</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail className="label-icon" />
              Email
            </label>
            <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="form-input"
                autoComplete="email"
                disabled={loading}
              />
              {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && !errors.email && (
                <CheckCircle2 className="input-icon success" />
              )}
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock className="label-icon" />
              Senha
            </label>
            <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <Eye className="toggle-password-icon" />
                ) : (
                  <EyeOff className="toggle-password-icon" />
                )}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {submitError && (
            <div className="error-message submit-error">{submitError}</div>
          )}

          <div className="form-options">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom" />
              <span className="checkbox-label">Lembrar-me</span>
            </label>
            <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>Esqueceu a senha?</a>
          </div>

          <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <svg className="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          <div className="login-footer-inline">
            <p>Sistema seguro · Tecnopano 3.0</p>
          </div>
        </form>
      </div>
    </div>
  );
}
