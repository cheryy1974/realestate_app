import { useEffect, useState } from 'react'

// フォームの初期値
const emptyValues = { name: '', rent: '', area: '', layout: '' }

// 物件の新規登録 / 編集を兼ねるフォーム
// initialValue が渡されたら編集モード、null/undefined なら新規モードとして動作する
export default function PropertyForm({
  initialValue,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [values, setValues] = useState(emptyValues)
  const [error, setError] = useState('')

  // 編集モードに切り替わったら初期値を流し込む
  useEffect(() => {
    if (initialValue) {
      setValues({
        name: initialValue.name ?? '',
        rent: String(initialValue.rent ?? ''),
        area: initialValue.area ?? '',
        layout: initialValue.layout ?? '',
      })
    } else {
      setValues(emptyValues)
    }
    setError('')
  }, [initialValue])

  const handleChange = (key) => (event) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    // 家賃は数値として保存するためここでバリデーション
    const rent = Number(values.rent)
    if (!Number.isFinite(rent) || rent < 0) {
      setError('家賃は0以上の数値を入力してください')
      return
    }

    try {
      await onSubmit({
        name: values.name.trim(),
        rent,
        area: values.area.trim(),
        layout: values.layout.trim(),
      })
    } catch (err) {
      setError(err?.message ?? '保存に失敗しました')
    }
  }

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      <h2>{initialValue ? '物件を編集' : '物件を新規登録'}</h2>

      <div className="form-grid">
        <label>
          物件名
          <input
            type="text"
            required
            value={values.name}
            onChange={handleChange('name')}
            placeholder="例: グランドメゾン渋谷"
          />
        </label>

        <label>
          家賃（円）
          <input
            type="number"
            required
            min="0"
            step="1000"
            value={values.rent}
            onChange={handleChange('rent')}
            placeholder="例: 180000"
          />
        </label>

        <label>
          エリア
          <input
            type="text"
            required
            value={values.area}
            onChange={handleChange('area')}
            placeholder="例: 東京都渋谷区"
          />
        </label>

        <label>
          間取り
          <input
            type="text"
            required
            value={values.layout}
            onChange={handleChange('layout')}
            placeholder="例: 1LDK"
          />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          キャンセル
        </button>
        <button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}
