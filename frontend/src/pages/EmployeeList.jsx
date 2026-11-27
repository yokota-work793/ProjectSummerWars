// 担当：指輪（画面）。社員一覧（API：GET /api/employees）
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api.js'
import { Flash } from '../Layout.jsx'

const shareTag = (s) => (s === '共有済み' ? 'ok' : s === '入社日に共有予定' ? 'wait' : 'gray')

export default function EmployeeList() {
  const location = useLocation()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('すべて')
  const [list, setList] = useState(null)
  const [error, setError] = useState('')

  const load = async (query = q, st = status) => {
    try {
      setList(await api.get(`/api/employees?q=${encodeURIComponent(query)}&status=${encodeURIComponent(st)}`))
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Flash message={location.state?.message} error={error} />
      <div className="row between mb"><h1>社員一覧</h1><Link className="btn" to="/employees/new">＋ 社員を登録</Link></div>
      <form className="row mb" onSubmit={(e) => { e.preventDefault(); load() }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="氏名・フリガナ・社員番号で検索" style={{ maxWidth: 360 }} />
        <select value={status} onChange={(e) => { setStatus(e.target.value); load(q, e.target.value) }} style={{ width: 'auto' }}>
          {['すべて', '在籍', '休職'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-sub">絞り込む</button>
      </form>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>社員番号</th><th>氏名</th><th>所属</th><th>雇用形態</th><th>入社日</th><th>在籍</th><th>勤怠シート</th><th></th></tr></thead>
          <tbody>
            {list === null && <tr><td colSpan={8} className="muted">読み込み中…</td></tr>}
            {list?.length === 0 && <tr><td colSpan={8} className="muted">該当する社員はいません。</td></tr>}
            {list?.map((e) => (
              <tr key={e.employeeNo}>
                <td>{e.employeeNo}</td><td className="strong">{e.name}</td><td>{e.department}</td>
                <td>{e.employmentType}</td><td>{e.joinedOn}</td>
                <td><span className={'tag ' + (e.status === '休職' ? 'wait' : 'ok')}>{e.status}</span></td>
                <td><span className={'tag ' + shareTag(e.shareState)}>{e.shareState}</span></td>
                <td><Link className="btn-outline" to={`/employees/${encodeURIComponent(e.employeeNo)}`}>詳細</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list && <p className="muted">{list.length}件を表示中</p>}
    </>
  )
}
