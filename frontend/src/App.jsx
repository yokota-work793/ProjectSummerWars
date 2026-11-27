// 担当：指輪（画面）。画面の切り替え（URL ごとにどの画面を出すか）とログインの確認
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { api } from './api.js'
import Layout from './Layout.jsx'
import Login from './pages/Login.jsx'
import EmployeeList from './pages/EmployeeList.jsx'
import EmployeeForm from './pages/EmployeeForm.jsx'
import Monthly from './pages/Monthly.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  // undefined＝確認中、null＝ログインしていない、文字列＝ログイン中のユーザー名
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    api.me().then((d) => setUser(d.username)).catch(() => setUser(null))
    const onLogout = () => setUser(null)
    window.addEventListener('kintai:logout', onLogout)
    return () => window.removeEventListener('kintai:logout', onLogout)
  }, [])

  if (user === undefined) return <div className="center muted">読み込み中…</div>
  if (user === null) return <Login onLogin={setUser} />

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={() => setUser(null)} />}>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/login" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/new" element={<EmployeeForm isNew />} />
        <Route path="/employees/:no" element={<EmployeeForm />} />
        <Route path="/monthly" element={<Monthly />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Route>
    </Routes>
  )
}
