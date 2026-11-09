import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { adminUserApi, UserItem, RolePermissionMatrix } from '../api/adminUserApi';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Edit3,
  ShieldCheck,
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Loader2,
  Sliders,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [matrix, setMatrix] = useState<RolePermissionMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'matrix'>('list');
  
  // Filtering & Pagination state
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [confirmUser, setConfirmUser] = useState<UserItem | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUserApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMatrix = useCallback(async () => {
    try {
      const data = await adminUserApi.getRolePermissions();
      setMatrix(data);
    } catch (err) {
      console.error('Fetch permissions matrix error:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchMatrix();
  }, [fetchUsers, fetchMatrix]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKeyword, filterRole, filterStatus, pageSize]);

  const handleToggleStatus = (targetUser: UserItem) => {
    setConfirmUser(targetUser);
  };

  const executeToggleStatus = async (targetUser: UserItem) => {
    const actionName = targetUser.enabled ? 'vô hiệu hóa' : 'kích hoạt';
    try {
      setTogglingId(targetUser.id);
      setError(null);
      const updated = await adminUserApi.setUserStatus(targetUser.id, !targetUser.enabled);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setActionSuccess(`Đã ${actionName} tài khoản '${targetUser.username}' thành công.`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      console.error('Toggle status error:', err);
      const msg = err.response?.data?.message || `Không thể ${actionName} tài khoản.`;
      setError(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleUserCreated = (newUser: UserItem) => {
    setUsers((prev) => [newUser, ...prev]);
    setActionSuccess(`Khởi tạo tài khoản '${newUser.username}' thành công.`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleUserUpdated = (updatedUser: UserItem) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setActionSuccess(`Cập nhật thông tin tài khoản '${updatedUser.username}' thành công.`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Text Search Filter
      if (filterKeyword.trim()) {
        const kw = filterKeyword.toLowerCase();
        const matches = (
          u.username.toLowerCase().includes(kw) ||
          (u.fullName || '').toLowerCase().includes(kw) ||
          (u.email || '').toLowerCase().includes(kw) ||
          u.role.toLowerCase().includes(kw)
        );
        if (!matches) return false;
      }

      // 2. Role Filter
      if (filterRole !== 'ALL' && u.role !== filterRole) {
        return false;
      }

      // 3. Status Filter
      if (filterStatus === 'ACTIVE' && !u.enabled) return false;
      if (filterStatus === 'LOCKED' && u.enabled) return false;

      return true;
    });
  }, [users, filterKeyword, filterRole, filterStatus]);

  // Pagination calculation
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return (
          <span className="badge-role badge-role--admin" title="Quản trị viên toàn hệ thống">
            <ShieldCheck size={13} />
            <span>Quản trị viên</span>
          </span>
        );
      case 'ROLE_STAFF':
        return (
          <span className="badge-role badge-role--staff" title="Nhân viên tác nghiệp">
            <Shield size={13} />
            <span>Nhân viên</span>
          </span>
        );
      case 'ROLE_USER':
      default:
        return (
          <span className="badge-role badge-role--user" title="Người dùng thông thường">
            <Shield size={13} />
            <span>Người dùng</span>
          </span>
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar currentView="users" />

      <main className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title">
            <h2>Quản lý người dùng</h2>
            <p>Quản lý tài khoản và quyền truy cập hệ thống</p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-secondary"
              onClick={fetchUsers}
              disabled={isLoading}
              title="Làm mới danh sách"
              id="refresh-users-btn"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Làm mới</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateOpen(true)}
              id="open-create-user-btn"
            >
              <UserPlus size={18} />
              <span>Thêm người dùng</span>
            </button>
          </div>
        </div>

        {/* Tab switcher: User list vs Role matrix */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
            id="tab-users-list"
          >
            <Users size={16} style={{ display: 'inline', marginRight: 6 }} />
            Danh sách tài khoản ({users.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
            id="tab-roles-matrix"
          >
            <ShieldCheck size={16} style={{ display: 'inline', marginRight: 6 }} />
            Ma trận phân quyền
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <span>{error}</span>
            <button
              type="button"
              className="close-alert-btn"
              onClick={() => setError(null)}
              aria-label="Đóng thông báo lỗi"
            >
              ×
            </button>
          </div>
        )}

        {actionSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
            <span>{actionSuccess}</span>
          </div>
        )}

        {activeTab === 'list' ? (
          <>
            {/* Filter Toolbar */}
            <div className="filter-toolbar" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="filter-left-group" style={{ flex: 1, minWidth: '280px', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                {/* Search field */}
                <div className="search-input-wrap" style={{ flex: '1 1 240px', minWidth: '200px' }}>
                  <Search size={16} className="search-icon-inside" />
                  <input
                    type="text"
                    className="search-input-field"
                    placeholder="Tìm theo tên đăng nhập, họ tên, email..."
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    id="user-search-input"
                  />
                  {filterKeyword && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setFilterKeyword('')}
                      title="Xóa tìm kiếm"
                      aria-label="Xóa từ khóa tìm kiếm"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Role filter dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <select
                    className="filter-select-field"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    id="user-role-filter"
                    aria-label="Lọc theo vai trò"
                  >
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="ROLE_ADMIN">Quản trị viên (ADMIN)</option>
                    <option value="ROLE_STAFF">Nhân viên (STAFF)</option>
                    <option value="ROLE_USER">Người dùng (USER)</option>
                  </select>
                </div>

                {/* Status filter dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <select
                    className="filter-select-field"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    id="user-status-filter"
                    aria-label="Lọc theo trạng thái"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="LOCKED">Đã khóa</option>
                  </select>
                </div>
              </div>

              {/* Counter summary */}
              <div className="filter-right-group">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Tổng cộng: <strong style={{ color: 'var(--color-text-main)' }}>{totalItems}</strong> tài khoản
                  {totalItems !== users.length && ` (lọc từ ${users.length})`}
                </span>
              </div>
            </div>

            {/* Users Table Card */}
            <div className="table-responsive-card">
              {isLoading ? (
                <div className="table-loading-wrap">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <p>Đang tải danh sách tài khoản...</p>
                </div>
              ) : (
                <>
                  <table className="data-table" id="users-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>ID</th>
                        <th>Người dùng</th>
                        <th>Email liên hệ</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th style={{ textAlign: 'center', width: '130px' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="empty-table-cell">
                            Không tìm thấy tài khoản nào phù hợp với điều kiện tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((u) => {
                          const isCurrentUser = currentUser?.username === u.username;
                          const initial = (u.username || '?').charAt(0).toUpperCase();

                          return (
                            <tr key={u.id} className={!u.enabled ? 'row-disabled' : ''}>
                              <td className="font-mono text-muted">{u.id}</td>

                              {/* User Info Stack */}
                              <td>
                                <div className="user-cell-wrap">
                                  <div className="user-avatar-initials" aria-hidden="true">
                                    {initial}
                                  </div>
                                  <div className="user-details-col">
                                    <div className="user-username-text">
                                      <span>{u.username}</span>
                                      {isCurrentUser && (
                                        <span className="badge-you">(Bạn)</span>
                                      )}
                                    </div>
                                    <span className="user-fullname-sub">
                                      {u.fullName || 'Chưa cập nhật họ tên'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td>
                                <span className="user-email-text">{u.email || '—'}</span>
                              </td>

                              {/* Role Badge (Vietnamese label, original ROLE_* preserved) */}
                              <td>{renderRoleBadge(u.role)}</td>

                              {/* Status Pill */}
                              <td>
                                <span
                                  className={`status-pill ${
                                    u.enabled ? 'status-pill--active' : 'status-pill--disabled'
                                  }`}
                                >
                                  {u.enabled ? (
                                    <>
                                      <CheckCircle2 size={12} />
                                      <span>Hoạt động</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle size={12} />
                                      <span>Đã khóa</span>
                                    </>
                                  )}
                                </span>
                              </td>

                              {/* Created Date */}
                              <td className="text-muted" style={{ fontSize: '0.825rem' }}>
                                {formatDate(u.createdAt)}
                              </td>

                              {/* Action Buttons Group */}
                              <td>
                                <div className="action-buttons-group">
                                  <button
                                    className="btn-icon btn-icon-secondary"
                                    onClick={() => {
                                      setEditingUser(u);
                                      setIsEditOpen(true);
                                    }}
                                    title="Chỉnh sửa & Gán vai trò"
                                    aria-label={`Chỉnh sửa tài khoản ${u.username}`}
                                    id={`edit-user-btn-${u.id}`}
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    className={`btn-icon ${
                                      u.enabled ? 'btn-icon-danger' : 'btn-icon-success'
                                    }`}
                                    onClick={() => handleToggleStatus(u)}
                                    disabled={togglingId === u.id || isCurrentUser}
                                    title={
                                      isCurrentUser
                                        ? 'Không thể tự khóa tài khoản của chính mình'
                                        : u.enabled
                                        ? 'Khóa tài khoản'
                                        : 'Kích hoạt lại tài khoản'
                                    }
                                    aria-label={
                                      u.enabled
                                        ? `Khóa tài khoản ${u.username}`
                                        : `Kích hoạt tài khoản ${u.username}`
                                    }
                                    id={`toggle-user-btn-${u.id}`}
                                  >
                                    {togglingId === u.id ? (
                                      <Loader2 size={15} className="animate-spin" />
                                    ) : u.enabled ? (
                                      <Lock size={15} />
                                    ) : (
                                      <Unlock size={15} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Bar */}
                  {totalItems > 0 && (
                    <div className="ent-pagination">
                      <div className="ent-pagination__info">
                        Hiển thị <strong>{startIndex + 1}</strong> -{' '}
                        <strong>{Math.min(startIndex + pageSize, totalItems)}</strong> trên tổng số{' '}
                        <strong>{totalItems}</strong> tài khoản
                      </div>

                      <div className="ent-pagination__controls">
                        {/* Page Size Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Mỗi trang:</span>
                          <select
                            className="ent-pagination__select"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            aria-label="Chọn số lượng tài khoản mỗi trang"
                          >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                          </select>
                        </div>

                        {/* Page Navigation Buttons */}
                        <button
                          type="button"
                          className="ent-pagination__btn"
                          onClick={() => setCurrentPage(1)}
                          disabled={safePage === 1}
                          title="Trang đầu"
                          aria-label="Trang đầu"
                        >
                          <ChevronsLeft size={16} />
                        </button>
                        <button
                          type="button"
                          className="ent-pagination__btn"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={safePage === 1}
                          title="Trang trước"
                          aria-label="Trang trước"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <span style={{ fontSize: '0.85rem', margin: '0 0.5rem', color: 'var(--color-text-main)', fontWeight: 600 }}>
                          Trang {safePage} / {totalPages}
                        </span>

                        <button
                          type="button"
                          className="ent-pagination__btn"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={safePage === totalPages}
                          title="Trang sau"
                          aria-label="Trang sau"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button
                          type="button"
                          className="ent-pagination__btn"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={safePage === totalPages}
                          title="Trang cuối"
                          aria-label="Trang cuối"
                        >
                          <ChevronsRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          /* Role & Permission Matrix View */
          <div className="matrix-container-card">
            <div className="matrix-header">
              <div className="matrix-title-wrap">
                <Sliders size={20} className="text-primary" />
                <div>
                  <h3>Ma trận phân quyền vai trò</h3>
                  <p className="text-muted">
                    Quyền của từng vai trò
                  </p>
                </div>
              </div>
            </div>

            {matrix ? (
              <div className="matrix-table-wrap">
                <table className="data-table matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '220px' }}>Quyền hạn / Chức năng</th>
                      <th>Mô tả chi tiết</th>
                      <th style={{ textAlign: 'center', width: '150px' }}>
                        <span className="badge-role badge-role--staff">Nhân viên</span>
                      </th>
                      <th style={{ textAlign: 'center', width: '150px' }}>
                        <span className="badge-role badge-role--admin">Quản trị viên</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(matrix.matrix['ROLE_ADMIN'] || []).map((adminPerm) => {
                      const staffPerm = (matrix.matrix['ROLE_STAFF'] || []).find(
                        (p) => p.code === adminPerm.code
                      );
                      const isStaffGranted = staffPerm ? staffPerm.granted : false;

                      return (
                        <tr key={adminPerm.code}>
                          <td>
                            <strong>{adminPerm.name}</strong>
                            <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                              {adminPerm.code}
                            </div>
                          </td>
                          <td className="text-muted">{adminPerm.description}</td>
                          <td style={{ textAlign: 'center' }}>
                            {isStaffGranted ? (
                              <CheckCircle2 size={18} className="text-success" />
                            ) : (
                              <XCircle size={18} className="text-muted" style={{ opacity: 0.4 }} />
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {adminPerm.granted ? (
                              <CheckCircle2 size={18} className="text-success" />
                            ) : (
                              <XCircle size={18} className="text-muted" style={{ opacity: 0.4 }} />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-loading-wrap">
                <Loader2 size={24} className="animate-spin text-primary" />
                <p>Đang tải ma trận phân quyền...</p>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <CreateUserModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onUserCreated={handleUserCreated}
        />

        <EditUserModal
          isOpen={isEditOpen}
          user={editingUser}
          onClose={() => {
            setIsEditOpen(false);
            setEditingUser(null);
          }}
          onUserUpdated={handleUserUpdated}
        />

        <ConfirmationModal
          isOpen={!!confirmUser}
          onClose={() => setConfirmUser(null)}
          onConfirm={async () => {
            if (!confirmUser) return;
            const target = confirmUser;
            setConfirmUser(null);
            await executeToggleStatus(target);
          }}
          title={confirmUser?.enabled ? 'Khóa tài khoản người dùng' : 'Kích hoạt tài khoản'}
          message={
            confirmUser?.enabled
              ? `Bạn có chắc chắn muốn vô hiệu hóa tài khoản '${confirmUser?.username}'? Người dùng này sẽ không thể đăng nhập vào hệ thống.`
              : `Bạn có chắc chắn muốn kích hoạt lại tài khoản '${confirmUser?.username}'?`
          }
          confirmLabel={confirmUser?.enabled ? 'Khóa tài khoản' : 'Kích hoạt'}
          variant={confirmUser?.enabled ? 'danger' : 'primary'}
          isLoading={togglingId === confirmUser?.id}
        />
      </main>
    </div>
  );
};
