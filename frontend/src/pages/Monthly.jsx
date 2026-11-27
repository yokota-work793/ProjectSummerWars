// 担当：指輪（画面）。月次集計（API：/api/monthly。列の定義は Java の MonthlyColumns＝山川さん）
import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Flash } from '../Layout.jsx'

export default function Monthly() {
  const [ym, setYm] = useState('')          // 入力欄の月
  const [view, setView] = useState(null)    // 表示中のデータ
  const [flash, setFlash] = useState({})
  const [busy, setBusy] = useState(false)

  const load = async (month) => {
    try {
      const v = await api.get('/api/monthly' + (month ? `?ym=${month}` : ''))
      setView(v); setYm(v.ym)
    } catch (e) { setFlash({ error: e.message }) }
  }
  useEffect(() => { load() }, [])

  const run = async (path, confirmText) => {
    if (confirmText && !confirm(confirmText)) return
    setBusy(true); setFlash({})
    try {
      const r = await api.post(`/api/monthly/${path}?ym=${view.ym}`)
      setFlash({ message: r.message, errors: r.errors })
      await load(view.ym)
    } catch (e) { setFlash({ error: e.message }) }
    finally { setBusy(false) }
  }

  if (!view) return <><Flash {...flash} /><p className="muted">読み込み中…</p></>
  const hasRows = view.rows.length > 0

  return (
    <>
      <Flash {...flash} />
      <div className="row between mb">
        <h1>月次集計</h1>
        <form className="row" onSubmit={(e) => { e.preventDefault(); load(ym) }}>
          <input type="month" value={ym} onChange={(e) => setYm(e.target.value)} style={{ width: 'auto' }} />
          <button className="btn-sub">表示</button>
        </form>
      </div>
      {view.fake && <div className="warn">Google につながっていないため、仮データで動いています（どの勤怠シートも平日 9:30〜18:30 として読みます）。</div>}
      <div className="card pad mb">
        <div className="muted mb">毎月の流れ（{view.ym}）</div>
        <div className="row">
          <button className="btn-outline" disabled={busy} onClick={() => run('sheets')}>① 全員の勤怠シートに月のシートを作る</button>
          <button className="btn" disabled={busy || view.fixed} onClick={() => run('collect')}>② 集計する</button>
          {hasRows && <a className="btn-outline" href={`/api/monthly/csv?ym=${view.ym}`}>③ CSVをダウンロード</a>}
          {hasRows && <button className="btn-outline" disabled={busy} onClick={() => run('send')}>③ 社労士へメールで送る</button>}
          {hasRows && !view.fixed && <button className="btn-danger" disabled={busy} onClick={() => run('fix', '確定すると、この月は集計し直せなくなります。よろしいですか？')}>④ 確定する</button>}
        </div>
        <p className="muted" style={{ margin: '10px 0 0' }}>交通費・経費は、フォームの回答シートで「承認」にした分だけ入ります（「設定」で回答シートを登録）。</p>
      </div>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr>{view.header.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {view.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
            {!hasRows && <tr><td colSpan={view.header.length} className="muted">まだ集計していません。「② 集計する」を押してください。</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
