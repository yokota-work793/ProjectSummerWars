// 担当：指輪（画面）。月次集計（API：/api/monthly。列の定義は Java の MonthlyColumns＝山川さん）
// 申請・取込状況はいまは仮データ（monthlyStatus.js）。実データへの差し替えは monthlyStatus.js だけ直せばよい
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { Flash } from '../Layout.jsx'
import { FILTERS, LEVEL, autoYm, mockRows, needsCheck, shiftYm, statusOf } from './monthlyStatus.js'

const Badge = ({ v }) => <span className={'tag ' + (LEVEL[v] || 'gray')}>{v}</span>

export default function Monthly() {
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState(null)
  const [flash, setFlash] = useState({})
  const [busy, setBusy] = useState(false)
  const [useMock, setUseMock] = useState(true)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const ym = params.get('ym') || autoYm()
  const thisYear = new Date().getFullYear()
  const [y, m] = ym.split('-')

  const load = async (month) => {
    try { setView(await api.get(`/api/monthly?ym=${month}`)) } catch (e) { setFlash({ error: e.message }) }
  }
  useEffect(() => { load(ym) }, [ym])  // eslint-disable-line react-hooks/exhaustive-deps
  const go = (next) => { setFlash({}); setParams({ ym: next }) }

  const run = async (path, confirmText) => {
    if (confirmText && !confirm(confirmText)) return
    setBusy(true); setFlash({})
    try { const r = await api.post(`/api/monthly/${path}?ym=${ym}`); setFlash({ message: r.message, errors: r.errors }); await load(ym) }
    catch (e) { setFlash({ error: e.message }) }
    finally { setBusy(false) }
  }

  // 表に出す行（仮データ or 実データ）と、それぞれの申請・取込状況
  const items = useMemo(() => {
    if (!view) return []
    if (useMock) return mockRows(view.ym)
    return view.rows.map((row) => ({ row, status: statusOf(row) }))
  }, [view, useMock])

  const shown = items.filter(({ row, status }) => {
    const f = FILTERS.find((x) => x.key === filter)
    if (f?.test && !f.test(status)) return false
    const k = q.trim()
    return !k || row[1].includes(k) || row[2].includes(k)
  })

  if (!view) return <><Flash {...flash} /><p className="muted">読み込み中…</p></>
  const hasRows = view.rows.length > 0
  const total = items.length
  const count = (k, fn) => items.filter(({ status }) => fn(status[k])).length
  const isOk = (v) => LEVEL[v] === 'ok'
  const isNg = (v) => ['warn', 'bad'].includes(LEVEL[v])
  const cards = [
    { key: 'attendance', title: '勤怠シート', done: count('attendance', isOk), ng: count('attendance', isNg), ngLabel: '未反映・未提出' },
    { key: 'expense', title: '交通費・経費フォーム', done: count('expense', isOk), ng: count('expense', isNg), ngLabel: '未申請・承認待ち' },
    { key: 'leave', title: '休暇申請フォーム', done: count('leave', isOk), ng: count('leave', isNg), ngLabel: '未申請・確認待ち' },
  ]
  const issues = items.filter(({ status }) => needsCheck(status)).length
  const header = view.header
  const rest = header.map((h, i) => i).filter((i) => i > 2) // 0=対象月 1=社員番号 2=氏名 は左に固定

  return (
    <>
      <Flash {...flash} />
      <div className="row between mb">
        <h1>月次集計</h1>
        <div className="row">
          <button className="btn-sub" onClick={() => go(shiftYm(ym, -1))}>◀ 前の月</button>
          <select value={y} onChange={(e) => go(`${e.target.value}-${m}`)} style={{ width: 'auto' }}>
            {Array.from({ length: 7 }, (_, i) => thisYear - 5 + i).map((v) => <option key={v} value={v}>{v}年</option>)}
          </select>
          <select value={m} onChange={(e) => go(`${y}-${e.target.value}`)} style={{ width: 'auto' }}>
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((v) => <option key={v} value={v}>{Number(v)}月</option>)}
          </select>
          <button className="btn-sub" onClick={() => go(shiftYm(ym, 1))}>次の月 ▶</button>
          <button className="btn-outline" onClick={() => go(autoYm())} title="1〜15日は前月、16日以降は当月">今の集計月へ</button>
        </div>
      </div>
      <p className="muted" style={{ marginTop: -8 }}>開いたときは日付から自動で選びます（1〜15日は前月、16日以降は当月）。いま：{autoYm().replace('-', '年')}月</p>

      {view.fake && <div className="warn">Google につながっていないため、仮データで動いています（どの勤怠シートも平日 9:30〜18:30 として読みます）。</div>}

      <div className="card pad mb">
        <div className="muted mb">毎月の流れ（{view.ym.replace('-', '年')}月）</div>
        <div className="row">
          <button className="btn-outline" disabled={busy} onClick={() => run('sheets')}>① 全員の勤怠シートに月のシートを作る</button>
          <button className="btn" disabled={busy || view.fixed} onClick={() => run('collect')}>② 集計する</button>
          {hasRows && <a className="btn-outline" href={`/api/monthly/csv?ym=${view.ym}`}>③ CSVをダウンロード</a>}
          {hasRows && <button className="btn-outline" disabled={busy} onClick={() => run('send')}>③ 社労士へメールで送る</button>}
          {hasRows && !view.fixed && <button className="btn-danger" disabled={busy} onClick={() => run('fix', '確定すると、この月は集計し直せなくなります。よろしいですか？')}>④ 確定する</button>}
        </div>
      </div>

      <div className="row between" style={{ marginBottom: 10 }}>
        <h2 className="section" style={{ margin: 0 }}>申請・取込状況</h2>
        <label className="row" style={{ gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={useMock} onChange={(e) => { setUseMock(e.target.checked); setFilter('all') }} style={{ width: 'auto' }} />
          仮データ（モック）で表示
        </label>
      </div>
      {useMock && <div className="info">いまは<strong>仮データ（モック）</strong>を表示しています。Google のフォーム・シートとの連携ができたら、実データに切り替わります。</div>}

      <div className="summary mb">
        <button className={'summary-card ' + (issues ? 'bad' : 'ok') + (filter === 'issue' ? ' on' : '')} onClick={() => setFilter(filter === 'issue' ? 'all' : 'issue')}>
          <div className="summary-title">申請漏れ・要確認</div>
          <div className="summary-num">{issues}<small> 人</small></div>
          <div className="summary-sub">{issues ? 'クリックで該当者だけ表示' : '問題ありません'}</div>
        </button>
        {cards.map((c) => (
          <button key={c.key} className={'summary-card ' + (c.ng ? 'warn' : 'ok') + (filter === c.key ? ' on' : '')} onClick={() => setFilter(filter === c.key ? 'all' : c.key)}>
            <div className="summary-title">{c.title}</div>
            <div className="summary-num">{c.done}<small> / {total} 人 反映済</small></div>
            <div className="summary-sub">{c.ng ? <span className="tag bad">{c.ngLabel} {c.ng}人</span> : <span className="tag ok">漏れなし</span>}</div>
          </button>
        ))}
      </div>

      <div className="row mb">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="氏名・社員番号で検索" style={{ maxWidth: 280 }} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
          {FILTERS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
        </select>
        <span className="muted">{shown.length} / {total} 人を表示</span>
      </div>

      <div className="card table-wrap">
        <table className="table monthly">
          <thead>
            <tr>
              <th className="stick s1">{header[1]}</th><th className="stick s2">{header[2]}</th>
              <th>勤怠シート</th><th>交通費・経費</th><th>休暇申請</th><th>申請漏れ・要確認</th>
              {rest.map((i) => <th key={i}>{header[i]}</th>)}
            </tr>
          </thead>
          <tbody>
            {shown.map(({ row, status }) => {
              const ng = needsCheck(status)
              return (
                <tr key={row[1]} className={ng ? 'row-issue' : ''}>
                  <td className="stick s1">{row[1]}</td><td className="stick s2 strong">{row[2]}</td>
                  <td><Badge v={status.attendance} /></td><td><Badge v={status.expense} /></td><td><Badge v={status.leave} /></td>
                  <td>{status.attendance === '未連携' ? <Badge v="未連携" /> : ng ? <span className="tag bad">要確認</span> : <span className="tag ok">問題なし</span>}</td>
                  {rest.map((i) => <td key={i}>{row[i]}</td>)}
                </tr>
              )
            })}
            {shown.length === 0 && (
              <tr><td colSpan={rest.length + 6} className="muted">
                {total === 0 ? 'まだ集計していません。「② 集計する」を押してください。' : '条件に合う社員はいません。'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="muted">交通費・経費は、フォームの回答シートで「承認」にした分だけ入ります（「設定」で回答シートを登録）。</p>
    </>
  )
}
