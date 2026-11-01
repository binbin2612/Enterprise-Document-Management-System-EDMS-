import React, { useState } from 'react';
import { UserPlus, Loader2, Shield, AlertCircle } from 'lucide-react';
import { adminUserApi, UserItem } from '../api/adminUserApi';
import { EnterpriseModal } from './common/EnterpriseModal';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: UserItem) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ROLE_STAFF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Mật khẩu tối thiểu phải từ 6 ký tự.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const newUser = await adminUserApi.createUser({
        username: username.trim(),
        password,
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
        role,
      });
      onUserCreated(newUser);
      onClose();
    } catch (err: any) {
      console.error('Create user error:', err);
      const msg = err.response?.data?.message || 'Không thể tạo người dùng. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerContent = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onClose}
        disabled={isSubmitting}
        id="close-create-user-btn"
      >
        Hủy
      </button>
      <button
        type="submit"
        form="create-user-form"
        className="btn btn-primary"
        disabled={isSubmitting}
        id="confirm-create-user-btn"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Đang tạo...</span>
          </>
        ) : (
          <>
            <UserPlus size={16} />
            <span>Tạo người dùng</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={isSubmitting}
      title="Thêm người dùng mới"
      subtitle="Khởi tạo tài khoản và phân quyền truy cập hệ thống"
      icon={<UserPlus size={20} className="text-primary" />}
      size="md"
      footer={footerContent}
    >
      <form id="create-user-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="ent-alert ent-alert--danger" role="alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="create-username-input">
            Tên đăng nhập <span className="text-danger">*</span>
          </label>
          <input
            id="create-username-input"
            type="text"
            className="form-input"
            placeholder="Ví dụ: nguyenvana"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <span className="form-hint">Duy nhất trong hệ thống, không thể thay đổi sau khi tạo.</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="create-password-input">
            Mật khẩu <span className="text-danger">*</span>
          </label>
          <input
            id="create-password-input"
            type="password"
            className="form-input"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="form-hint">Mật khẩu sẽ được mã hóa an toàn bằng thuật toán BCrypt.</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="create-fullname-input">Họ và tên</label>
          <input
            id="create-fullname-input"
            type="text"
            className="form-input"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="create-email-input">Email</label>
          <input
            id="create-email-input"
            type="email"
            className="form-input"
            placeholder="Ví dụ: vana@edms.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="create-role-select">
            Vai trò hệ thống <span className="text-danger">*</span>
          </label>
          <div className="select-with-icon">
            <Shield size={16} className="text-muted" />
            <select
              id="create-role-select"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ROLE_USER">ROLE_USER (Người dùng cơ bản)</option>
              <option value="ROLE_STAFF">ROLE_STAFF (Chuyên viên)</option>
              <option value="ROLE_ADMIN">ROLE_ADMIN (Quản trị viên)</option>
            </select>
          </div>
        </div>
      </form>
    </EnterpriseModal>
  );
};

export default CreateUserModal;
