import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProperties } from '../hooks/useProperties'
import PropertyForm from '../components/PropertyForm'

// 物件一覧画面（ログイン後のホーム）
// Supabase の properties テーブルに対して CRUD を行う
export default function Properties() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    properties,
    loading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
  } = useProperties()

  // フォームの状態
  // - null         : フォーム非表示
  // - 'create'     : 新規登録モード
  // - property obj : 編集モード（対象の物件を保持）
  const [formMode, setFormMode] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // ログアウト処理: Supabase のセッションを破棄してログイン画面へ
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  // フォーム送信: モードに応じて INSERT または UPDATE
  const handleSubmit = async (input) => {
    setSubmitting(true)
    try {
      if (formMode === 'create') {
        await createProperty(input)
      } else if (formMode && typeof formMode === 'object') {
        await updateProperty(formMode.id, input)
      }
      setFormMode(null)
    } finally {
      setSubmitting(false)
    }
  }

  // 削除: 確認ダイアログを挟んでから DELETE
  const handleDelete = async (property) => {
    const confirmed = window.confirm(
      `「${property.name}」を削除します。よろしいですか？`,
    )
    if (!confirmed) return
    try {
      await deleteProperty(property.id)
    } catch (err) {
      window.alert(err?.message ?? '削除に失敗しました')
    }
  }

  const isFormOpen = formMode !== null

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>物件一覧</h1>
          {user?.email && (
            <p className="user-email">{user.email} でログイン中</p>
          )}
        </div>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          ログアウト
        </button>
      </header>

      {/* フォーム表示中はフォーム、それ以外は新規登録ボタンを出す */}
      {isFormOpen ? (
        <PropertyForm
          initialValue={formMode === 'create' ? null : formMode}
          onSubmit={handleSubmit}
          onCancel={() => setFormMode(null)}
          submitting={submitting}
        />
      ) : (
        <div className="actions-bar">
          <button type="button" onClick={() => setFormMode('create')}>
            + 物件を新規登録
          </button>
        </div>
      )}

      {loading && <p className="muted">読み込み中...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && properties.length === 0 && !isFormOpen && (
        <p className="muted">
          まだ物件が登録されていません。「+ 物件を新規登録」から追加してください。
        </p>
      )}

      <ul className="property-grid">
        {properties.map((property) => (
          <li key={property.id} className="property-card">
            <h2>{property.name}</h2>
            <p className="rent">¥{property.rent.toLocaleString()} / 月</p>
            <p className="area">{property.area}</p>
            <p className="layout">{property.layout}</p>
            <div className="card-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFormMode(property)}
              >
                編集
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => handleDelete(property)}
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
