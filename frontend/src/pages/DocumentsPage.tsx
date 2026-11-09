import React, { useState, useEffect, useCallback } from 'react';
import { documentApi, DocumentItem } from '../api/documentApi';
import { savedSearchApi, SavedSearchItem } from '../api/savedSearchApi';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { UploadModal } from '../components/UploadModal';
import { PreviewModal } from '../components/PreviewModal';
import { PrintMetadataModal } from '../components/PrintMetadataModal';
import { EditModal } from '../components/EditModal';
import { SaveSearchModal } from '../components/SaveSearchModal';
import { DocumentAccessModal } from '../components/DocumentAccessModal';
import { DocumentVersionModal } from '../components/DocumentVersionModal';
import {
  Plus,
  RefreshCw,
  FileText,
  Inbox,
  Eye,
  Download,
  Printer,
  Loader2,
  Search,
  SlidersHorizontal,
  Edit3,
  X,
  RotateCcw,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Shield,
  Lock,
  Globe,
  History,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Archive,
  ShieldAlert,
  Calendar,
  Cpu,
} from 'lucide-react';
import { DocumentReviewHistoryModal } from '../components/DocumentReviewHistoryModal';
import { DocumentLifecycleModal } from '../components/DocumentLifecycleModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

const DOCUMENT_TYPES = [
  'Báo cáo',
  'Hợp đồng',
  'Hóa đơn',
  'Quyết định',
  'Công văn',
  'Biên bản',
  'Khác',
];

interface VisibleColumns {
  documentType: boolean;
  originalFileName: boolean;
  fileSize: boolean;
  createdBy: boolean;
  createdAt: boolean;
}

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'shared'>('all');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRebuildingOcr, setIsRebuildingOcr] = useState<boolean>(false);
  const [ocrRebuildMsg, setOcrRebuildMsg] = useState<string | null>(null);
  const [showOcrConfirm, setShowOcrConfirm] = useState<boolean>(false);
  const [deleteSavedSearchTarget, setDeleteSavedSearchTarget] = useState<number | null>(null);

  const handleRebuildOcrExecute = async () => {
    setShowOcrConfirm(false);
    try {
      setIsRebuildingOcr(true);
      const res = await documentApi.rebuildOcrIndex(false);
      setOcrRebuildMsg(`Quét lại OCR hoàn tất: Tổng=${res.total}, Đủ ĐK=${res.eligible}, Sẵn sàng=${res.ready}, Bỏ qua=${res.skipped}`);
      await fetchDocuments();
    } catch (err: any) {
      setError('Lỗi quét lại OCR: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsRebuildingOcr(false);
    }
  };

  // Phase 5: Access & Sharing state
  const [accessDoc, setAccessDoc] = useState<DocumentItem | null>(null);
  const [isAccessOpen, setIsAccessOpen] = useState<boolean>(false);

  // Phase 6: Versioning state
  const [versionDoc, setVersionDoc] = useState<DocumentItem | null>(null);
  const [isVersionOpen, setIsVersionOpen] = useState<boolean>(false);

  // US-04: Search state
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchScope, setSearchScope] = useState<'METADATA' | 'CONTENT' | 'ALL'>('METADATA');
  // Phase 12: Search mode
  const [searchMode, setSearchMode] = useState<'LEXICAL' | 'SEMANTIC' | 'HYBRID'>('LEXICAL');

  // US-05: Filter state
  const [filterType, setFilterType] = useState<string>('');

  // US-07: Saved Search state
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // US-06: Result Display Fields selection state
  const [isColSelectOpen, setIsColSelectOpen] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    documentType: true,
    originalFileName: true,
    fileSize: true,
    createdBy: true,
    createdAt: true,
  });

  // US-13 & US-14: Edit Document state
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  // US-08, US-09 & Print states
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [printDoc, setPrintDoc] = useState<DocumentItem | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Phase 7 Review states
  const [historyModalDoc, setHistoryModalDoc] = useState<DocumentItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [submittingReviewId, setSubmittingReviewId] = useState<number | null>(null);

  // Phase 8: Lifecycle & Retention state
  const [lifecycleDoc, setLifecycleDoc] = useState<DocumentItem | null>(null);
  const [isLifecycleOpen, setIsLifecycleOpen] = useState<boolean>(false);
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('');

  const handleDownload = async (doc: DocumentItem) => {
    try {
      setDownloadingId(doc.id);
      await documentApi.downloadDocument(doc.id, doc.originalFileName);
    } catch (err) {
      console.error('Download error:', err);
      setError('Không thể tải xuống tệp tin. Vui lòng thử lại sau.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSubmitReview = async (doc: DocumentItem) => {
    try {
      setSubmittingReviewId(doc.id);
      await documentApi.submitDocumentReview(doc.id);
      fetchDocuments();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gửi yêu cầu xét duyệt.');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {
        q: searchQuery.trim() ? searchQuery.trim() : undefined,
        searchScope: searchScope !== 'METADATA' ? searchScope : undefined,
        searchMode: searchMode !== 'LEXICAL' ? searchMode : undefined,
        documentType: filterType ? filterType : undefined,
        lifecycleStatus: (lifecycleFilter || undefined) as any,
      };
      if (activeTab === 'all') {
        const data = await documentApi.getAllDocuments(params);
        setDocuments(data);
      } else if (activeTab === 'mine') {
        const data = await documentApi.getMyDocuments(params);
        setDocuments(data);
      } else if (activeTab === 'shared') {
        const data = await documentApi.getSharedWithMeDocuments(params);
        setDocuments(data);
      }
    } catch (err: any) {
      console.error('Fetch documents error:', err);
      setError('Không thể tải danh sách tài liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, searchScope, searchMode, filterType, lifecycleFilter]);

  const fetchSavedSearches = useCallback(async () => {
    try {
      const data = await savedSearchApi.getSavedSearches();
      setSavedSearches(data);
    } catch (err) {
      console.error('Fetch saved searches error:', err);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchSavedSearches();
  }, [fetchDocuments, fetchSavedSearches]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSearchScope('METADATA');
    setFilterType('');
    setLifecycleFilter('');
  };

  const handleApplySavedSearch = (item: SavedSearchItem) => {
    setSearchInput(item.query || '');
    setSearchQuery(item.query || '');
    setSearchScope((item.searchScope as any) || 'METADATA');
    setFilterType(item.documentType || '');
    setIsSavedSearchesOpen(false);
  };

  const handleDeleteSavedSearch = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteSavedSearchTarget(id);
  };

  const handleDeleteSavedSearchConfirm = async () => {
    if (deleteSavedSearchTarget === null) return;
    const id = deleteSavedSearchTarget;
    try {
      await savedSearchApi.deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      setDeleteSavedSearchTarget(null);
    } catch (err) {
      console.error('Delete saved search error:', err);
      setError('Không thể xóa bộ lọc tìm kiếm đã lưu.');
      setDeleteSavedSearchTarget(null);
    }
  };

  const handleSavedSearchCreated = (saved: SavedSearchItem) => {
    setSavedSearches((prev) => [saved, ...prev]);
  };

  const toggleColumn = (key: keyof VisibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  const getTypePillClass = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'hợp đồng':
      case 'contract':
        return 'type-pill type-contract';
      case 'hóa đơn':
      case 'invoice':
        return 'type-pill type-invoice';
      case 'báo cáo':
      case 'report':
        return 'type-pill type-report';
      default:
        return 'type-pill type-general';
    }
  };

  const totalVisibleCols =
    2 + (Object.values(visibleColumns).filter(Boolean).length as number);
  const isFiltered = Boolean(searchQuery.trim() || filterType || lifecycleFilter || searchScope !== 'METADATA');

  return (
    <div className="app-container">
      <Navbar currentView="documents" />

      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h2>Quản lý tài liệu</h2>
            <p>Tra cứu và quản lý tài liệu theo quyền truy cập</p>
          </div>
          <div className="page-actions">
            {user?.role === 'ROLE_ADMIN' && (
              <button
                className="btn btn-secondary"
                onClick={() => setShowOcrConfirm(true)}
                disabled={isRebuildingOcr || isLoading}
                title="Quét lại chỉ mục OCR cho hình ảnh và scanned PDF"
                id="rebuild-ocr-btn"
              >
                <Cpu size={16} className={isRebuildingOcr ? 'animate-spin' : ''} />
                <span>{isRebuildingOcr ? 'Đang quét...' : 'Quét lại OCR'}</span>
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={fetchDocuments}
              disabled={isLoading}
              title="Làm mới danh sách"
              id="refresh-docs-btn"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Làm mới</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
              id="open-upload-modal-btn"
            >
              <Plus size={18} />
              <span>Tải lên tài liệu</span>
            </button>
          </div>
        </div>

        {ocrRebuildMsg && (
          <div style={{
            margin: '0.5rem 0 1rem',
            padding: '0.6rem 1rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            color: '#166534',
            fontSize: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{ocrRebuildMsg}</span>
            <button onClick={() => setOcrRebuildMsg(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#166534' }}>✕</button>
          </div>
        )}

        {/* Tab switcher: All vs Mine vs Shared */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            id="tab-all-docs"
          >
            Tất cả tài liệu
          </button>
          <button
            className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
            id="tab-mine-docs"
          >
            Tài liệu của tôi
          </button>
          <button
            className={`tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
            onClick={() => setActiveTab('shared')}
            id="tab-shared-docs"
          >
            Được chia sẻ với tôi
          </button>
        </div>

        {/* Sprint 2 Filter Toolbar: US-04 (Search), US-05 (Filter), US-06 (Column Selector) */}
        <div className="filter-toolbar">
          <div className="filter-left-group">
            {/* US-04: Search Box */}
            <form onSubmit={handleSearchSubmit} className="search-input-wrap">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input-field"
                placeholder="Tìm kiếm tiêu đề, mô tả, tệp tin, phân loại..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                id="doc-search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={handleClearSearch}
                  title="Xóa tìm kiếm"
                  id="clear-search-btn"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSearchQuery(searchInput)}
              id="submit-search-btn"
            >
              Tìm kiếm
            </button>

            {/* Search Scope Selector */}
            <select
              className="filter-select-field"
              value={searchScope}
              onChange={(e) => setSearchScope(e.target.value as any)}
              id="search-scope-select"
              title="Phạm vi tìm kiếm"
            >
              <option value="METADATA">Tìm trong: Thông tin tài liệu</option>
              <option value="CONTENT">Tìm trong: Nội dung tài liệu</option>
              <option value="ALL">Tìm trong: Tất cả (Thông tin &amp; Nội dung)</option>
            </select>

            {/* Search Mode Selector */}
            <select
              className="filter-select-field"
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as any)}
              id="search-mode-select"
              title="Phương thức tìm kiếm"
            >
              <option value="LEXICAL">Tìm chính xác (Từ khóa)</option>
              <option value="SEMANTIC">Tìm theo ngữ nghĩa</option>
              <option value="HYBRID">Tìm kiếm kết hợp</option>
            </select>

            {/* Filter by Document Type */}
            <select
              className="filter-select-field"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              id="doc-type-filter"
            >
              <option value="">-- Tất cả loại tài liệu --</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Phase 8: Filter by Lifecycle Status */}
            <select
              className="filter-select-field"
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value)}
              id="lifecycle-filter-select"
            >
              <option value="">-- Vòng đời (Tất cả) --</option>
              <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
              <option value="ARCHIVED">Đã lưu trữ (ARCHIVED)</option>
            </select>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                title="Xóa tất cả bộ lọc và tìm kiếm"
                id="reset-filter-btn"
              >
                <RotateCcw size={14} />
                <span>Đặt lại</span>
              </button>
            )}

            {/* Save current search button */}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => setIsSaveModalOpen(true)}
              title="Lưu điều kiện tìm kiếm hiện tại"
              id="open-save-search-btn"
            >
              <BookmarkPlus size={14} />
              <span>Lưu bộ lọc</span>
            </button>
          </div>

          <div className="filter-right-group">
            {/* Saved Searches Dropdown */}
            <div className="saved-searches-container">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsSavedSearchesOpen(!isSavedSearchesOpen)}
                id="saved-searches-dropdown-btn"
                title="Xem và tái sử dụng các bộ lọc đã lưu"
              >
                <Bookmark size={14} />
                <span>Tìm kiếm đã lưu ({savedSearches.length})</span>
              </button>

              {isSavedSearchesOpen && (
                <div className="saved-searches-dropdown-card">
                  <div className="saved-searches-dropdown-header">
                    <span>Bộ lọc tìm kiếm đã lưu</span>
                    <button
                      type="button"
                      className="btn-icon-subtle"
                      onClick={() => setIsSavedSearchesOpen(false)}
                      title="Đóng"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {savedSearches.length === 0 ? (
                    <p className="saved-searches-empty text-muted">Chưa có bộ lọc nào được lưu.</p>
                  ) : (
                    <div className="saved-searches-list">
                      {savedSearches.map((item) => (
                        <div
                          key={item.id}
                          className="saved-search-item"
                          onClick={() => handleApplySavedSearch(item)}
                          title="Click để áp dụng bộ lọc này"
                        >
                          <div className="saved-search-item-info">
                            <span className="saved-search-item-name">{item.name}</span>
                            <div className="saved-search-item-tags">
                              {item.query && <span className="criteria-pill">q: "{item.query}"</span>}
                              {item.documentType && (
                                <span className="criteria-pill">loại: {item.documentType}</span>
                              )}
                              {!item.query && !item.documentType && (
                                <span className="criteria-pill">Tất cả</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-icon-trash"
                            onClick={(e) => handleDeleteSavedSearch(e, item.id)}
                            title="Xóa bộ lọc này"
                            id={`delete-saved-search-btn-${item.id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* US-06: Select Result Display Fields */}
            <div className="column-selector-container">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsColSelectOpen(!isColSelectOpen)}
                id="column-selector-btn"
                title="Tùy chỉnh các cột hiển thị trong danh sách"
              >
                <SlidersHorizontal size={14} />
                <span>Hiển thị cột ({Object.values(visibleColumns).filter(Boolean).length}/5)</span>
              </button>

              {isColSelectOpen && (
                <div className="column-dropdown-card">
                  <div className="column-dropdown-title">Tùy chọn hiển thị</div>
                  <label className="column-checkbox-row">
                    <input
                      type="checkbox"
                      checked={visibleColumns.documentType}
                      onChange={() => toggleColumn('documentType')}
                      id="col-toggle-type"
                    />
                    <span>Loại tài liệu</span>
                  </label>
                  <label className="column-checkbox-row">
                    <input
                      type="checkbox"
                      checked={visibleColumns.originalFileName}
                      onChange={() => toggleColumn('originalFileName')}
                      id="col-toggle-file"
                    />
                    <span>Tệp đính kèm</span>
                  </label>
                  <label className="column-checkbox-row">
                    <input
                      type="checkbox"
                      checked={visibleColumns.fileSize}
                      onChange={() => toggleColumn('fileSize')}
                      id="col-toggle-size"
                    />
                    <span>Dung lượng</span>
                  </label>
                  <label className="column-checkbox-row">
                    <input
                      type="checkbox"
                      checked={visibleColumns.createdBy}
                      onChange={() => toggleColumn('createdBy')}
                      id="col-toggle-author"
                    />
                    <span>Người tạo</span>
                  </label>
                  <label className="column-checkbox-row">
                    <input
                      type="checkbox"
                      checked={visibleColumns.createdAt}
                      onChange={() => toggleColumn('createdAt')}
                      id="col-toggle-date"
                    />
                    <span>Ngày tạo</span>
                  </label>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.35rem' }}>
                    * Tiêu đề &amp; Thao tác luôn hiển thị
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search / Filter Result Indicator */}
        {isFiltered && (
          <div className="search-stats">
            <span>
              Kết quả lọc: <strong>{documents.length}</strong> tài liệu phù hợp
              {searchQuery && <> với từ khóa "<strong>{searchQuery}</strong>"</>}
              {filterType && <> thuộc loại "<strong>{filterType}</strong>"</>}
            </span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <span>{error}</span>
          </div>
        )}

        {/* Document Table Card (Desktop / Tablet View) */}
        <div className="card-table desktop-table-view">
          <div className="table-responsive">
            <table className="custom-table" id="documents-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>Tên tài liệu &amp; Mô tả</th>
                  {visibleColumns.documentType && <th style={{ width: '13%' }}>Loại tài liệu</th>}
                  {visibleColumns.originalFileName && <th style={{ width: '18%' }}>Tệp đính kèm</th>}
                  {visibleColumns.fileSize && <th style={{ width: '10%' }}>Dung lượng</th>}
                  {visibleColumns.createdBy && <th style={{ width: '10%' }}>Người tạo</th>}
                  {visibleColumns.createdAt && <th style={{ width: '12%' }}>Ngày tạo</th>}
                  <th style={{ minWidth: '180px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={totalVisibleCols} style={{ textAlign: 'center', padding: '2.5rem' }}>
                      <p style={{ color: 'var(--color-text-muted)' }}>Đang tải danh sách tài liệu...</p>
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={totalVisibleCols}>
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <Inbox size={42} color="var(--color-text-muted)" />
                        </div>
                        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-main)' }}>
                          {isFiltered
                            ? 'Không tìm thấy tài liệu phù hợp với điều kiện tìm kiếm/lọc'
                            : 'Chưa có tài liệu nào trong danh mục này'}
                        </p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {isFiltered ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={handleResetFilters}
                              style={{ marginTop: '0.5rem' }}
                            >
                              Xóa bộ lọc để xem tất cả
                            </button>
                          ) : (
                            'Bấm nút "Tải lên tài liệu" để thêm tài liệu đầu tiên vào hệ thống.'
                          )}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => {
                    const canEdit =
                      user?.role === 'ROLE_ADMIN' ||
                      user?.username === doc.createdBy ||
                      doc.userPermission === 'EDIT';
                    const canShare =
                      user?.role === 'ROLE_ADMIN' || user?.username === doc.createdBy;

                    return (
                      <tr key={doc.id} className="doc-row" data-id={doc.id}>
                        <td>
                          <div className="doc-title" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <span>{doc.title}</span>
                            {doc.accessMode === 'PRIVATE' ? (
                              <span
                                className="ent-badge ent-badge--danger"
                                title="Chế độ riêng tư: Chỉ người được chia sẻ mới truy cập được"
                              >
                                <Lock size={10} /> Riêng tư
                              </span>
                            ) : (
                              <span
                                className="ent-badge ent-badge--primary"
                                title="Chế độ nội bộ: Mọi người dùng đã đăng nhập đều xem được"
                              >
                                <Globe size={10} /> Nội bộ
                              </span>
                            )}
                            {/* Current Version Badge */}
                            <span
                              className="ent-badge ent-badge--info"
                              title={`Phiên bản hiện tại: v${doc.currentVersionNumber || 1}`}
                            >
                              v{doc.currentVersionNumber || 1}
                            </span>

                            {/* Current Version Review Status Badge */}
                            {(() => {
                              const rStatus = doc.currentReviewStatus || doc.reviewStatus || 'DRAFT';
                              if (rStatus === 'APPROVED') {
                                return (
                                  <span
                                    className="ent-badge ent-badge--success"
                                    title="Phiên bản này đã được phê duyệt"
                                  >
                                    <CheckCircle2 size={10} /> Đã duyệt
                                  </span>
                                );
                              }
                              if (rStatus === 'PENDING') {
                                return (
                                  <span
                                    className="ent-badge ent-badge--warning"
                                    title="Phiên bản này đang chờ quản trị viên xét duyệt"
                                  >
                                    <Clock size={10} /> Chờ duyệt
                                  </span>
                                );
                              }
                              if (rStatus === 'REJECTED') {
                                return (
                                  <span
                                    className="ent-badge ent-badge--danger"
                                    title="Phiên bản này đã bị từ chối. Vui lòng tải lên phiên bản mới để gửi duyệt lại."
                                  >
                                    <AlertTriangle size={10} /> Bị từ chối
                                  </span>
                                );
                              }
                              return (
                                <span
                                  className="ent-badge ent-badge--neutral"
                                  title="Bản nháp — Chưa gửi xét duyệt"
                                >
                                  Nháp
                                </span>
                              );
                            })()}

                            {/* Lifecycle Status Badge */}
                            {doc.lifecycleStatus === 'ARCHIVED' ? (
                              <span
                                className="ent-badge ent-badge--neutral"
                                title={`Đã lưu trữ (Archived) bởi ${doc.archivedBy || 'User'}`}
                              >
                                <Archive size={10} /> Đã lưu trữ
                              </span>
                            ) : (
                              <span
                                className="ent-badge ent-badge--success"
                                title="Đang hoạt động (Active)"
                              >
                                <CheckCircle2 size={10} /> Đang hoạt động
                              </span>
                            )}

                            {/* Legal Hold Badge */}
                            {doc.legalHold && (
                              <span
                                className="ent-badge ent-badge--danger"
                                title={`Legal Hold đang bật: ${doc.legalHoldReason || 'Bảo lưu pháp lý'}`}
                              >
                                <ShieldAlert size={10} /> Legal Hold
                              </span>
                            )}

                            {/* Retention Date */}
                            {doc.retentionUntil && (
                              <span
                                className="ent-badge ent-badge--neutral"
                                title={`Thời hạn lưu trữ tối thiểu: ${doc.retentionUntil}`}
                              >
                                <Calendar size={10} /> Giữ đến {doc.retentionUntil}
                              </span>
                            )}

                            {/* Disposition Eligibility */}
                            {doc.eligibleForDisposition && (
                              <span
                                className="ent-badge ent-badge--warning"
                                title="Tài liệu đã hết hạn lưu trữ và đủ điều kiện tiêu hủy / thanh lý"
                              >
                                Đủ ĐK tiêu hủy
                              </span>
                            )}
                            {doc.userPermission && doc.userPermission !== 'OWNER' && doc.userPermission !== 'ADMIN' && (
                              <span className="ent-badge ent-badge--warning">
                                {doc.userPermission === 'EDIT' ? 'Quyền: Xem & Sửa' : 'Quyền: Chỉ xem'}
                              </span>
                            )}
                          </div>
                          {doc.description && <div className="doc-desc">{doc.description}</div>}
                          {doc.contentMatched && (
                            <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <span
                                className="ent-badge ent-badge--success"
                                title="Khớp với nội dung bên trong tệp tin của phiên bản hiện tại"
                              >
                                Khớp nội dung
                              </span>
                              {doc.contentSource === 'OCR' && (
                                <span
                                  className="ent-badge ent-badge--info"
                                  title="Khớp từ nội dung nhận dạng quang học (OCR)"
                                >
                                  [OCR]
                                </span>
                              )}
                              {doc.matchSnippet && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#475569',
                                    fontStyle: 'italic',
                                    background: '#f8fafc',
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: '3px',
                                    borderLeft: '2px solid #10b981',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={doc.matchSnippet}
                                >
                                  {doc.matchSnippet}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {visibleColumns.documentType && (
                          <td>
                            <span className={getTypePillClass(doc.documentType)}>
                              {doc.documentType || 'Chung'}
                            </span>
                          </td>
                        )}

                        {visibleColumns.originalFileName && (
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <FileText size={16} color="var(--color-primary)" />
                              <span style={{ fontSize: '0.85rem' }} title={doc.originalFileName}>
                                {doc.originalFileName}
                              </span>
                            </div>
                          </td>
                        )}

                        {visibleColumns.fileSize && (
                          <td>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                              {formatFileSize(doc.fileSize)}
                            </span>
                          </td>
                        )}

                        {visibleColumns.createdBy && (
                          <td>
                            <span style={{ fontWeight: 500 }}>{doc.createdBy}</span>
                          </td>
                        )}

                        {visibleColumns.createdAt && (
                          <td>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                              {formatDate(doc.createdAt)}
                            </span>
                          </td>
                        )}

                        <td style={{ textAlign: 'center' }}>
                          <div className="table-actions">
                            {/* US-08: Preview */}
                            <button
                              className="action-btn preview-btn"
                              title="Xem trước tài liệu trực tiếp"
                              onClick={() => {
                                setPreviewDoc(doc);
                                setIsPreviewOpen(true);
                              }}
                              id={`preview-doc-btn-${doc.id}`}
                            >
                              <Eye size={14} />
                              <span className="action-btn-text">Xem</span>
                            </button>

                            {/* US-09: Download */}
                            <button
                              className="action-btn download-btn"
                              title="Tải xuống tệp gốc về máy"
                              disabled={downloadingId === doc.id}
                              onClick={() => handleDownload(doc)}
                              id={`download-doc-btn-${doc.id}`}
                            >
                              {downloadingId === doc.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Download size={14} />
                              )}
                              <span className="action-btn-text">Tải về</span>
                            </button>

                            {/* US-13 & US-14: Edit & Classify */}
                            <button
                              className="action-btn edit-btn"
                              title={
                                doc.lifecycleStatus === 'ARCHIVED'
                                  ? 'Tài liệu đã lưu trữ ở chế độ chỉ đọc, không thể chỉnh sửa'
                                  : canEdit
                                  ? 'Chỉnh sửa thông tin & phân loại tài liệu'
                                  : 'Bạn không có quyền chỉnh sửa tài liệu này'
                              }
                              disabled={!canEdit || doc.lifecycleStatus === 'ARCHIVED'}
                              onClick={() => {
                                setEditingDoc(doc);
                                setIsEditOpen(true);
                              }}
                              style={{
                                opacity: canEdit && doc.lifecycleStatus !== 'ARCHIVED' ? 1 : 0.45,
                                cursor: canEdit && doc.lifecycleStatus !== 'ARCHIVED' ? 'pointer' : 'not-allowed',
                              }}
                              id={`edit-doc-btn-${doc.id}`}
                            >
                              <Edit3 size={14} />
                              <span className="action-btn-text">Sửa</span>
                            </button>

                            {/* Phase 5: Share & Access Control */}
                            {canShare && (
                              <button
                                className="action-btn share-btn"
                                title={
                                  doc.lifecycleStatus === 'ARCHIVED'
                                    ? 'Tài liệu đã lưu trữ không thể thay đổi phân quyền'
                                    : 'Phân quyền & Chia sẻ tài liệu'
                                }
                                disabled={doc.lifecycleStatus === 'ARCHIVED'}
                                onClick={() => {
                                  if (doc.lifecycleStatus === 'ARCHIVED') return;
                                  setAccessDoc(doc);
                                  setIsAccessOpen(true);
                                }}
                                id={`share-doc-btn-${doc.id}`}
                                style={{
                                  color: 'var(--color-primary)',
                                  borderColor: '#c7d2fe',
                                  opacity: doc.lifecycleStatus !== 'ARCHIVED' ? 1 : 0.45,
                                  cursor: doc.lifecycleStatus !== 'ARCHIVED' ? 'pointer' : 'not-allowed',
                                }}
                              >
                                <Shield size={14} />
                                <span className="action-btn-text">Chia sẻ</span>
                              </button>
                            )}

                             {/* Document Versions */}
                            <button
                              className="action-btn version-btn"
                              title="Lịch sử phiên bản tài liệu"
                              onClick={() => {
                                setVersionDoc(doc);
                                setIsVersionOpen(true);
                              }}
                              id={`version-doc-btn-${doc.id}`}
                              style={{ color: '#0284c7', borderColor: '#bae6fd' }}
                            >
                              <History size={14} />
                              <span className="action-btn-text">Phiên bản</span>
                            </button>

                            {/* Phase 7: Submit for Review */}
                            {canEdit && (
                              <button
                                className="action-btn"
                                title={
                                  doc.lifecycleStatus === 'ARCHIVED'
                                    ? 'Tài liệu đã lưu trữ không thể gửi xét duyệt'
                                    : (doc.currentReviewStatus || doc.reviewStatus || 'DRAFT') === 'DRAFT'
                                    ? 'Gửi phiên bản hiện tại để quản trị viên xét duyệt'
                                    : (doc.currentReviewStatus || doc.reviewStatus) === 'PENDING'
                                    ? 'Phiên bản này đang chờ xét duyệt'
                                    : (doc.currentReviewStatus || doc.reviewStatus) === 'APPROVED'
                                    ? 'Phiên bản này đã được phê duyệt'
                                    : 'Phiên bản này đã bị từ chối. Hãy tải lên phiên bản mới để gửi duyệt lại'
                                }
                                disabled={
                                  doc.lifecycleStatus === 'ARCHIVED' ||
                                  (doc.currentReviewStatus || doc.reviewStatus || 'DRAFT') !== 'DRAFT' ||
                                  submittingReviewId === doc.id
                                }
                                onClick={() => handleSubmitReview(doc)}
                                id={`submit-review-doc-btn-${doc.id}`}
                                style={{
                                  color: '#059669',
                                  borderColor: '#a7f3d0',
                                  opacity:
                                    doc.lifecycleStatus !== 'ARCHIVED' &&
                                    (doc.currentReviewStatus || doc.reviewStatus || 'DRAFT') === 'DRAFT'
                                      ? 1
                                      : 0.45,
                                  cursor:
                                    doc.lifecycleStatus !== 'ARCHIVED' &&
                                    (doc.currentReviewStatus || doc.reviewStatus || 'DRAFT') === 'DRAFT'
                                      ? 'pointer'
                                      : 'not-allowed',
                                }}
                              >
                                {submittingReviewId === doc.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Send size={14} />
                                )}
                                <span className="action-btn-text">Gửi duyệt</span>
                              </button>
                            )}

                            {/* Lifecycle Management (Archive / Unarchive / Retention / Hold) */}
                            <button
                              className="action-btn"
                              title="Quản lý vòng đời, lưu trữ & thời hạn retention"
                              onClick={() => {
                                setLifecycleDoc(doc);
                                setIsLifecycleOpen(true);
                              }}
                              id={`lifecycle-doc-btn-${doc.id}`}
                              style={{
                                color: doc.lifecycleStatus === 'ARCHIVED' ? '#475569' : '#0d9488',
                                borderColor: doc.lifecycleStatus === 'ARCHIVED' ? '#cbd5e1' : '#ccfbf1',
                              }}
                            >
                              <Archive size={14} />
                              <span className="action-btn-text">
                                {doc.lifecycleStatus === 'ARCHIVED' ? 'Lưu trữ' : 'Lưu trữ'}
                              </span>
                            </button>

                            {/* Review History */}
                            <button
                              className="action-btn"
                              title="Xem lịch sử xét duyệt của tài liệu này"
                              onClick={() => {
                                setHistoryModalDoc(doc);
                                setIsHistoryModalOpen(true);
                              }}
                              id={`review-history-doc-btn-${doc.id}`}
                              style={{ color: '#7c3aed', borderColor: '#ddd6fe' }}
                            >
                              <ShieldCheck size={14} />
                              <span className="action-btn-text">Lịch sử duyệt</span>
                            </button>

                            {/* Print Metadata */}
                            <button
                              className="action-btn print-btn"
                              title="In phiếu đặc tả thông tin tài liệu"
                              onClick={() => {
                                setPrintDoc(doc);
                                setIsPrintOpen(true);
                              }}
                              id={`print-doc-btn-${doc.id}`}
                            >
                              <Printer size={14} />
                              <span className="action-btn-text">In</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View (Viewport <= 480px) */}
        <div className="mobile-card-feed" id="documents-mobile-card-feed">
          {isLoading ? (
            <div className="mobile-loading-card">
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                Đang tải danh sách tài liệu...
              </p>
            </div>
          ) : documents.length === 0 ? (
            <div className="mobile-empty-card">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Inbox size={36} color="var(--color-text-muted)" />
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                  {isFiltered
                    ? 'Không tìm thấy tài liệu phù hợp'
                    : 'Chưa có tài liệu nào trong danh mục'}
                </p>
              </div>
            </div>
          ) : (
            documents.map((doc) => {
              const canEdit =
                user?.role === 'ROLE_ADMIN' ||
                user?.username === doc.createdBy ||
                doc.userPermission === 'EDIT';
              const canShare =
                user?.role === 'ROLE_ADMIN' || user?.username === doc.createdBy;

              return (
                <div key={`mobile-${doc.id}`} className="mobile-doc-card" data-mobile-id={doc.id}>
                  <div className="mobile-card-header">
                    <div className="mobile-card-title-group">
                      <span className="mobile-card-title">{doc.title}</span>
                      <div className="mobile-badge-row">
                        {doc.accessMode === 'PRIVATE' ? (
                          <span className="mobile-badge badge-private">
                            <Lock size={10} /> Riêng tư
                          </span>
                        ) : (
                          <span className="mobile-badge badge-public">
                            <Globe size={10} /> Công khai
                          </span>
                        )}
                        <span className="mobile-badge badge-type">
                          {doc.documentType}
                        </span>
                        {doc.currentVersionNumber && (
                          <span className="mobile-badge badge-version">
                            v{doc.currentVersionNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {doc.description && (
                    <p className="mobile-card-description">{doc.description}</p>
                  )}

                  <div className="mobile-card-details">
                    <div className="mobile-detail-row">
                      <FileText size={13} color="var(--color-primary)" />
                      <span className="mobile-file-name" title={doc.originalFileName}>
                        {doc.originalFileName}
                      </span>
                      <span className="mobile-file-size">
                        ({formatFileSize(doc.fileSize)})
                      </span>
                    </div>

                    <div className="mobile-detail-meta">
                      <span>Người tạo: <strong>{doc.createdBy}</strong></span>
                      <span>•</span>
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>

                    <div className="mobile-status-badges">
                      {doc.lifecycleStatus === 'ARCHIVED' ? (
                        <span className="mobile-status-pill pill-archived">
                          <Archive size={10} /> Đã lưu trữ
                        </span>
                      ) : (
                        <span className="mobile-status-pill pill-active">
                          <CheckCircle2 size={10} /> Đang hoạt động
                        </span>
                      )}

                      {doc.legalHold && (
                        <span className="mobile-status-pill pill-hold">
                          <ShieldAlert size={10} /> Legal Hold
                        </span>
                      )}

                      {doc.currentReviewStatus && (
                        <span className={`mobile-status-pill pill-review-${doc.currentReviewStatus.toLowerCase()}`}>
                          Duyệt: {doc.currentReviewStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mobile-card-actions">
                    <button
                      type="button"
                      className="mobile-action-btn btn-view"
                      onClick={() => {
                        setPreviewDoc(doc);
                        setIsPreviewOpen(true);
                      }}
                      id={`mobile-preview-btn-${doc.id}`}
                    >
                      <Eye size={13} />
                      <span>Xem</span>
                    </button>

                    <button
                      type="button"
                      className="mobile-action-btn btn-download"
                      disabled={downloadingId === doc.id}
                      onClick={() => handleDownload(doc)}
                      id={`mobile-download-btn-${doc.id}`}
                    >
                      {downloadingId === doc.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Download size={13} />
                      )}
                      <span>Tải về</span>
                    </button>

                    <button
                      type="button"
                      className="mobile-action-btn btn-edit"
                      disabled={!canEdit || doc.lifecycleStatus === 'ARCHIVED'}
                      onClick={() => {
                        setEditingDoc(doc);
                        setIsEditOpen(true);
                      }}
                      id={`mobile-edit-btn-${doc.id}`}
                    >
                      <Edit3 size={13} />
                      <span>Sửa</span>
                    </button>

                    {canShare && (
                      <button
                        type="button"
                        className="mobile-action-btn btn-share"
                        disabled={doc.lifecycleStatus === 'ARCHIVED'}
                        onClick={() => {
                          setAccessDoc(doc);
                          setIsAccessOpen(true);
                        }}
                        id={`mobile-share-btn-${doc.id}`}
                      >
                        <Shield size={13} />
                        <span>Chia sẻ</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="mobile-action-btn btn-version"
                      onClick={() => {
                        setVersionDoc(doc);
                        setIsVersionOpen(true);
                      }}
                      id={`mobile-version-btn-${doc.id}`}
                    >
                      <History size={13} />
                      <span>Phiên bản</span>
                    </button>

                    <button
                      type="button"
                      className="mobile-action-btn btn-lifecycle"
                      onClick={() => {
                        setLifecycleDoc(doc);
                        setIsLifecycleOpen(true);
                      }}
                      id={`mobile-lifecycle-btn-${doc.id}`}
                    >
                      <Archive size={13} />
                      <span>Vòng đời</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Upload Modal (US-10, US-11, US-12) */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDocuments}
      />

      {/* Edit Modal (US-13, US-14) */}
      <EditModal
        document={editingDoc}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingDoc(null);
        }}
        onSuccess={fetchDocuments}
      />

      {/* Preview Modal (US-08) */}
      <PreviewModal
        document={previewDoc}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDoc(null);
        }}
        onDownload={handleDownload}
      />

      {/* Print Metadata Modal */}
      <PrintMetadataModal
        document={printDoc}
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
          setPrintDoc(null);
        }}
      />

      {/* Save Search Modal (US-07) */}
      <SaveSearchModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentQuery={searchInput || searchQuery}
        currentDocumentType={filterType}
        currentSearchScope={searchScope}
        onSaved={handleSavedSearchCreated}
      />

      {/* Document Access & Sharing Modal (Phase 5) */}
      <DocumentAccessModal
        document={accessDoc}
        isOpen={isAccessOpen}
        onClose={() => {
          setIsAccessOpen(false);
          setAccessDoc(null);
        }}
        onSuccess={fetchDocuments}
      />

      {/* Phase 6: Document Version Modal */}
      <DocumentVersionModal
        document={versionDoc}
        isOpen={isVersionOpen}
        onClose={() => {
          setIsVersionOpen(false);
          setVersionDoc(null);
        }}
        onSuccess={() => fetchDocuments()}
      />

      {/* Phase 7: Document Review History Modal */}
      <DocumentReviewHistoryModal
        document={historyModalDoc}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryModalDoc(null);
        }}
      />

      {/* Phase 8: Document Lifecycle Modal */}
      <DocumentLifecycleModal
        document={lifecycleDoc}
        isOpen={isLifecycleOpen}
        onClose={() => {
          setIsLifecycleOpen(false);
          setLifecycleDoc(null);
        }}
        onSuccess={() => {
          fetchDocuments();
        }}
      />

      {showOcrConfirm && (
        <ConfirmationModal
          isOpen={showOcrConfirm}
          onClose={() => setShowOcrConfirm(false)}
          onConfirm={handleRebuildOcrExecute}
          title="Xác nhận quét lại OCR"
          message="Bạn muốn quét lại nội dung nhận dạng của các tài liệu đủ điều kiện? Thao tác có thể mất vài phút."
          confirmLabel="Bắt đầu Rebuild"
          cancelLabel="Hủy"
          variant="primary"
        />
      )}

      {deleteSavedSearchTarget !== null && (
        <ConfirmationModal
          isOpen={deleteSavedSearchTarget !== null}
          onClose={() => setDeleteSavedSearchTarget(null)}
          onConfirm={handleDeleteSavedSearchConfirm}
          title="Xóa bộ lọc tìm kiếm"
          message="Bạn có chắc chắn muốn xóa bộ lọc tìm kiếm đã lưu này không?"
          confirmLabel="Xóa bộ lọc"
          cancelLabel="Hủy"
          variant="danger"
        />
      )}
    </div>
  );
};
