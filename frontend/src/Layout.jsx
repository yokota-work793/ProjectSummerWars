// 担当：指輪（画面）。左メニューと、各画面の共通部品（お知らせ表示）
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from './api.js'

export default function Layout({ user, onLogout }) {
  const navigate = useNavigate()
  const logout = async () => {
    try { await api.logout() } catch { /* すでに切れていても画面はログインへ */ }
    onLogout()
    navigate('/login')
  }
  const cls = ({ isActive }) => 'side-item' + (isActive ? ' on' : '')
  return (
    <div className="app">
      <nav className="side">
        <div className="side-title">勤怠・給与集計</div>
        <NavLink to="/employees" className={cls}>社員管理</NavLink>
        <NavLink to="/monthly" className={cls}>月次集計</NavLink>
        <NavLink to="/settings" className={cls}>設定</NavLink>
        <div className="side-logout">
          <div className="side-user">{user}</div>
          <button className="link light" onClick={logout}>ログアウト</button>
        </div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

/** お知らせ（緑）・エラー（赤）・人ごとのエラー一覧 */
export function Flash({ message, error, errors }) {
  return (
    <>
      {message && <div className="toast">{message}</div>}
      {error && <div className="err">{error}</div>}
      {errors?.length > 0 && <div className="err"><ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div>}
    </>
  )
}
