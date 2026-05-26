import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// 会員登録画面
export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // フォーム送信時の処理: Supabase でアカウント作成
  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    setSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    // メール確認が有効な場合はセッションが返らないため、案内を表示
    if (!data.session) {
      setInfoMessage(
        '確認メールを送信しました。メール内のリンクから登録を完了してください。',
      )
      return
    }

    // セッションが直ちに発行された場合は物件一覧へ遷移
    navigate('/properties', { replace: true })
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>会員登録</h1>

        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label>
          パスワード（6文字以上）
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        {errorMessage && <p className="error">{errorMessage}</p>}
        {infoMessage && <p className="info">{infoMessage}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? '登録中...' : '登録する'}
        </button>

        <p className="auth-switch">
          既にアカウントをお持ちの方は <Link to="/login">ログイン</Link>
        </p>
      </form>
    </div>
  )
}
