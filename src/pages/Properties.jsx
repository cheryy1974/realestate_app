import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// ダミーの物件データ（後で Supabase の DB に置き換える想定）
const dummyProperties = [
  {
    id: 1,
    name: 'グランドメゾン渋谷',
    rent: 185000,
    area: '東京都渋谷区',
  },
  {
    id: 2,
    name: 'パークホームズ目黒',
    rent: 220000,
    area: '東京都目黒区',
  },
  {
    id: 3,
    name: 'リバーサイド横浜',
    rent: 145000,
    area: '神奈川県横浜市',
  },
  {
    id: 4,
    name: 'サニーコート世田谷',
    rent: 128000,
    area: '東京都世田谷区',
  },
  {
    id: 5,
    name: 'プレミアム品川タワー',
    rent: 310000,
    area: '東京都港区',
  },
  {
    id: 6,
    name: 'ガーデンヒルズ吉祥寺',
    rent: 165000,
    area: '東京都武蔵野市',
  },
]

// 物件一覧画面（ログイン後のホーム）
export default function Properties() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // ログアウト処理: Supabase のセッションを破棄してログイン画面へ
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>物件一覧</h1>
          {user?.email && <p className="user-email">{user.email} でログイン中</p>}
        </div>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          ログアウト
        </button>
      </header>

      <ul className="property-grid">
        {dummyProperties.map((property) => (
          <li key={property.id} className="property-card">
            <h2>{property.name}</h2>
            <p className="rent">¥{property.rent.toLocaleString()} / 月</p>
            <p className="area">{property.area}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
