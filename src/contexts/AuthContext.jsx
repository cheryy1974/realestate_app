import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// 認証状態をアプリ全体で共有するためのコンテキスト
const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
})

// 認証プロバイダー: Supabase のセッションを購読し、子コンポーネントへ提供する
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初回マウント時に現在のセッションを取得
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // セッション変化（ログイン・ログアウト・トークン更新）を購読
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      },
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 認証情報を取得するためのフック
export function useAuth() {
  return useContext(AuthContext)
}
