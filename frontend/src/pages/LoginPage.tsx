import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  FileCheck,
  Cpu,
  Radio,
  ExternalLink,
  Loader2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Rate-limit countdown timer
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) {
          setError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds !== null && lockoutSeconds > 0) return;

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login({ username: username.trim(), password });
    } catch (err: any) {
      const resData = err.response?.data;
      const status = err.response?.status;

      if (status === 429) {
        const secs = resData?.retryAfterSeconds || resData?.lockoutSeconds || 60;
        setLockoutSeconds(secs);
        setError(`Bạn đã thử quá số lần cho phép. Thử lại sau ${secs} giây.`);
      } else if (!err.response) {
        setError('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.');
      } else if (status === 401) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      } else if (status === 403) {
        setError('Yêu cầu đăng nhập bị từ chối. Vui lòng tải lại trang và thử lại.');
      } else if (status >= 500) {
        setError('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.');
      } else {
        setError(resData?.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ent-login-layout">
      {/* Giới thiệu ngắn gọn các chức năng chính */}
      <div className="ent-login-hero">
        <div className="ent-login-hero__overlay" />
        <div className="ent-login-hero__content">
          <div className="ent-login-hero__brand">
            <div className="ent-login-hero__logo">
              <FileCheck size={28} className="text-white" />
            </div>
            <div>
              <h1 className="ent-login-hero__title">EDMS — Quản lý tài liệu</h1>
              <p className="ent-login-hero__subtitle">Lưu trữ và xử lý tài liệu điện tử</p>
            </div>
          </div>

          <div className="ent-login-hero__features">
            <div className="ent-login-feature-item">
              <div className="ent-login-feature-item__icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="ent-login-feature-item__title">Lưu trữ tài liệu tập trung</h4>
                <p className="ent-login-feature-item__desc">
                  Quản lý tài liệu và phiên bản trong cùng một hệ thống.
                </p>
              </div>
            </div>

            <div className="ent-login-feature-item">
              <div className="ent-login-feature-item__icon">
                <Cpu size={20} />
              </div>
              <div>
                <h4 className="ent-login-feature-item__title">Tra cứu tài liệu</h4>
                <p className="ent-login-feature-item__desc">
                  Tìm kiếm, theo dõi và truy cập tài liệu theo quyền được cấp.
                </p>
              </div>
            </div>

            <div className="ent-login-feature-item">
              <div className="ent-login-feature-item__icon">
                <Radio size={20} />
              </div>
              <div>
                <h4 className="ent-login-feature-item__title">Theo dõi công việc</h4>
                <p className="ent-login-feature-item__desc">
                  Xem công việc được giao và các thông báo liên quan.
                </p>
              </div>
            </div>
          </div>

          <div className="ent-login-hero__footer">
            <span className="ent-login-hero__status-indicator" />
            <span>Truy cập dành cho người dùng được cấp tài khoản</span>
          </div>
        </div>
      </div>

      {/* Biểu mẫu đăng nhập */}
      <div className="ent-login-form-pane">
        <div className="ent-login-form-container">
          <div className="ent-login-card">
            <div className="ent-login-card__header">
              <div className="ent-login-card__badge">
                <Lock size={22} />
              </div>
              <h2 className="ent-login-card__title">Đăng nhập</h2>
              <p className="ent-login-card__desc">
                Nhập thông tin xác thực để truy cập kho lưu trữ điện tử
              </p>
            </div>

            {error && (
              <div className="ent-alert ent-alert--danger mb-4" id="login-error-alert" role="alert">
                <AlertCircle size={18} className="ent-alert__icon" />
                <div className="ent-alert__content">
                  <span>{error}</span>
                  {lockoutSeconds !== null && lockoutSeconds > 0 && (
                    <div className="ent-alert__countdown">
                      Mở khóa sau: <strong>{lockoutSeconds}s</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ent-login-form">
              <div className="ent-form-group">
                <label className="ent-form-label" htmlFor="username-input">
                  Tên đăng nhập
                </label>
                <div className="ent-input-wrapper">
                  <input
                    id="username-input"
                    type="text"
                    className="ent-input"
                    placeholder="Nhập tên tài khoản"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    disabled={isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                  />
                </div>
              </div>

              <div className="ent-form-group">
                <div className="ent-form-label-row">
                  <label className="ent-form-label" htmlFor="password-input">
                    Mật khẩu
                  </label>
                </div>
                <div className="ent-input-wrapper ent-input-wrapper--password">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="ent-input"
                    placeholder="Nhập mật khẩu an toàn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    disabled={isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                  />
                  <button
                    type="button"
                    className="ent-input-addon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="ent-btn ent-btn--primary ent-btn--lg ent-btn--block mt-4"
                disabled={isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                id="login-submit-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="ent-login-card__footer">
              <a
                href="/verify"
                className="ent-login-card__verify-link"
                title="Kiểm tra thông tin xác thực của tài liệu mà không cần đăng nhập"
              >
                <ShieldCheck size={16} />
                <span>Kiểm tra tính xác thực tài liệu</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
