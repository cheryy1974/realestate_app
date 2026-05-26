import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// 未ログインユーザーをログイン画面へリダイレクトするルートガード
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  // セッション取得中はチラつき防止のためローディング表示
  if (loading) {
    return <div className="loading">読み込み中...</div>
  }

  // 未ログインの場合はログイン画面へ
  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
