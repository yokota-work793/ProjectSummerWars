// 担当：指輪（画面）。ログイン
import { useState } from 'react'
import { api } from '../api.js'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await api.me().catch(() => {})       // 安全対策の値（Cookie）を先にもらう
      await api.login(username, password)
      const me = await api.me()
      onLogin(me.username)
    } catch {
      setError('ユーザー名かパスワードが違います。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="center">
      <form className="card pad login" onSubmit={submit}>
        <h1>勤怠・給与集計</h1>
        {error && <div className="err">{error}</div>}
        <label>ユーザー名<input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required /></label>
        <label>パスワード<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="btn" disabled={busy}>{busy ? 'ログイン中…' : 'ログイン'}</button>
      </form>
    </div>
  )
}
