import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Supabase の properties テーブルに対する CRUD を提供するフック
// RLS によりサーバー側で「自分の物件のみ」に絞られるため、
// クライアントでは user_id でのフィルタは不要
export function useProperties() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 一覧取得（新しい順）
  const fetchProperties = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setProperties([])
    } else {
      setProperties(data ?? [])
    }
    setLoading(false)
  }, [])

  // ログイン状態が変化したら再取得
  useEffect(() => {
    if (user) {
      fetchProperties()
    } else {
      setProperties([])
      setLoading(false)
    }
  }, [user, fetchProperties])

  // 新規登録: user_id は現在のログインユーザーで固定
  const createProperty = async (input) => {
    const { error: insertError } = await supabase
      .from('properties')
      .insert({ ...input, user_id: user.id })
    if (insertError) throw insertError
    await fetchProperties()
  }

  // 更新
  const updateProperty = async (id, input) => {
    const { error: updateError } = await supabase
      .from('properties')
      .update(input)
      .eq('id', id)
    if (updateError) throw updateError
    await fetchProperties()
  }

  // 削除
  const deleteProperty = async (id) => {
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    if (deleteError) throw deleteError
    await fetchProperties()
  }

  return {
    properties,
    loading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties,
  }
}
