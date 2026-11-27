// 担当：指輪（画面）。社員の登録・詳細（API：/api/employees。入力のチェックは Java の EmployeeForm＝宮谷さん）
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { Flash } from '../Layout.jsx'

const NUMBER_FIELDS = ['base', 'commute', 'housing']
const emptyRow = () => ({ project: '', amount: 0, from: null, to: null })
const emptyAllowance = () => ({ name: '', amount: 0 })

/** 画面の入力を API に送る形にする（数字は数に、空の日付は null に） */
function toPayload(form) {
  const p = { ...form }
  NUMBER_FIELDS.forEach((k) => { p[k] = Number(p[k] || 0) })
  p.history = (form.history || []).map((h) => ({
    project: h.project || '', amount: Number(h.amount || 0), from: h.from || null, to: h.to || null,
  }))
  p.allowances = (form.allowances || []).map((a) => ({ name: a.name || '', amount: Number(a.amount || 0) }))
  return p
}

export default function EmployeeForm({ isNew = false }) {
  const { no } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)      // 表示だけの情報（共有状態など）
  const [form, setForm] = useState(null)      // 入力欄
  const [errors, setErrors] = useState({})
  const [flash, setFlash] = useState({})
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const d = await api.get(isNew ? '/api/employees/new' : `/api/employees/${encodeURIComponent(no)}`)
      setData(d)
      setForm({
        ...d.form,
        history: d.form.history?.length ? d.form.history : [emptyRow()],
        allowances: d.form.allowances?.length ? d.form.allowances : [emptyAllowance()],
      })
    } catch (e) { setFlash({ error: e.message }) }
  }
  useEffect(() => { load() }, [no, isNew])  // eslint-disable-line react-hooks/exhaustive-deps

  if (!form) return <><Flash {...flash} /><p className="muted">読み込み中…</p></>

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const setRow = (i, k) => (e) => {
    const history = form.history.map((h, j) => (j === i ? { ...h, [k]: e.target.value } : h))
    setForm({ ...form, history })
  }
  const addRow = () => setForm({ ...form, history: [...form.history, emptyRow()] })
  const setAllowance = (i, k) => (e) => {
    const allowances = form.allowances.map((a, j) => (j === i ? { ...a, [k]: e.target.value } : a))
    setForm({ ...form, allowances })
  }
  const addAllowance = () => setForm({ ...form, allowances: [...form.allowances, emptyAllowance()] })
  const removeAllowance = (i) => setForm({ ...form, allowances: form.allowances.filter((_, j) => j !== i) })
  const removeRow = (i) => setForm({ ...form, history: form.history.filter((_, j) => j !== i) })
  const err = (k) => errors[k] && <small className="field-error">{errors[k]}</small>
  const bad = (k) => (errors[k] ? 'bad' : undefined)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true); setErrors({}); setFlash({})
    try {
      const r = isNew
        ? await api.post('/api/employees', toPayload(form))
        : await api.put(`/api/employees/${encodeURIComponent(no)}`, toPayload(form))
      if (isNew) navigate('/employees', { state: { message: r.message } })
      else { setFlash({ message: r.message }); await load() }
    } catch (ex) {
      setErrors(ex.errors || {})
      setFlash({ error: ex.message })
      window.scrollTo(0, 0)
    } finally { setBusy(false) }
  }

  const remove = async () => {
    if (!confirm('削除すると社員一覧から消え、勤怠シートの本人への共有を止めます。勤怠シートは残します。よろしいですか？')) return
    try {
      const r = await api.del(`/api/employees/${encodeURIComponent(no)}`)
      navigate('/employees', { state: { message: r.message } })
    } catch (ex) { setFlash({ error: ex.message }) }
  }

  const recreate = async () => {
    if (!confirm('ひな型から新しい勤怠シートを作ります。今のシートは残ります。よろしいですか？')) return
    try { const r = await api.post(`/api/employees/${encodeURIComponent(no)}/recreate-sheet`); setFlash({ message: r.message }); await load() }
    catch (ex) { setFlash({ error: ex.message }) }
  }

  return (
    <>
      <Link className="back" to="/employees">← 社員一覧へ戻る</Link>
      <Flash {...flash} />

      {isNew ? (
        <>
          <div className="row between mb"><h1>社員を登録</h1></div>
          <p className="muted lead">勤怠シートのURLが空なら、ひな型から勤怠シートと個人フォルダを作り、入社日の朝に本人へ共有します。<span className="req">*</span> は必須です。</p>
        </>
      ) : (
        <div className="row between mb" style={{ alignItems: 'flex-end' }}>
          <div>
            <div className="muted">{form.no}　{data.department || ''}</div>
            <h1>{data.name} <span className="kana">{data.kana}</span></h1>
          </div>
          <button className="btn-danger" onClick={remove}>この社員を削除</button>
        </div>
      )}

      <form onSubmit={save}>
        <h2 className="section">基本情報</h2>
        <div className="card pad grid">
          <label>社員番号 <span className="req">*</span><input value={form.no || ''} onChange={set('no')} readOnly={!isNew} placeholder="E0004" className={bad('no')} />{err('no')}</label>
          <label>氏名 <span className="req">*</span><input value={form.name || ''} onChange={set('name')} placeholder="例：佐藤 花子" className={bad('name')} />{err('name')}</label>
          <label>フリガナ<input value={form.kana || ''} onChange={set('kana')} placeholder="サトウ ハナコ" /></label>
          <label>メールアドレス <span className="req">*</span><input type="email" value={form.mail || ''} onChange={set('mail')} placeholder="hanako@example.com" className={bad('mail')} />{err('mail')}</label>
          <label>所属<input value={form.dept || ''} onChange={set('dept')} placeholder="開発部" /></label>
          <label>雇用形態<select value={form.type} onChange={set('type')}>{['正社員', '契約社員', 'パート・アルバイト'].map((t) => <option key={t}>{t}</option>)}</select></label>
          <label>入社日 <span className="req">*</span><input type="date" value={form.joined || ''} onChange={set('joined')} className={bad('joined')} />{err('joined')}</label>
          {!isNew && <label>在籍<select value={form.status} onChange={set('status')}>{['在籍', '休職'].map((s) => <option key={s}>{s}</option>)}</select></label>}
        </div>

        <h2 className="section">給与条件</h2>
        <div className="card pad grid">
          <label>給与形態<select value={form.payType} onChange={set('payType')}>{['月給', '日給', '時給'].map((p) => <option key={p}>{p}</option>)}</select></label>
          <label>基本給（円）<input inputMode="numeric" value={form.base ?? ''} onChange={set('base')} className={bad('base')} />{err('base')}</label>
          <label>1日の標準時間<input value={form.stdTime || ''} onChange={set('stdTime')} placeholder="8:00" className={bad('stdTime')} />{err('stdTime')}</label>
        </div>
        <p className="muted">給与計算は社労士が行います。ここでは社労士に渡す条件を登録します。</p>

        <h2 className="section">手当</h2>
        <div className="card pad grid">
          <label>通勤手当（月額・円）<input inputMode="numeric" value={form.commute ?? ''} onChange={set('commute')} className={bad('commute')} />{err('commute')}</label>
          <label>住宅手当（月額・円）<input inputMode="numeric" value={form.housing ?? ''} onChange={set('housing')} className={bad('housing')} /><small>{data.housingNote}</small>{err('housing')}</label>
        </div>
        <div className="card table-wrap" style={{ marginTop: 12 }}>
          <table className="table" style={{ minWidth: 480 }}>
            <thead><tr><th>手当の名前</th><th>月額（円）</th><th></th></tr></thead>
            <tbody>
              {form.allowances.map((a, i) => (
                <tr key={i}>
                  <td><input value={a.name || ''} onChange={setAllowance(i, 'name')} placeholder="例：資格手当・役職手当" className={bad(`allowances[${i}].name`)} />{err(`allowances[${i}].name`)}</td>
                  <td><input inputMode="numeric" value={a.amount ?? ''} onChange={setAllowance(i, 'amount')} className={bad(`allowances[${i}].amount`)} />{err(`allowances[${i}].amount`)}</td>
                  <td><button type="button" className="link" onClick={() => removeAllowance(i)}>削除</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button type="button" className="btn-outline" onClick={addAllowance}>＋ 手当を追加</button>
          <span className="muted">名前が空の行は保存しません。月次集計には合計が入ります。</span>
        </div>

        <h2 className="section">案件・参画履歴</h2>
        <div className="card table-wrap">
          <table className="table" style={{ minWidth: 640 }}>
            <thead><tr><th>案件</th><th>インセンティブ月額（円）</th><th>参画開始</th><th>参画終了</th><th></th></tr></thead>
            <tbody>
              {form.history.map((h, i) => (
                <tr key={i}>
                  <td><input value={h.project || ''} onChange={setRow(i, 'project')} placeholder="案件名" /></td>
                  <td><input inputMode="numeric" value={h.amount ?? ''} onChange={setRow(i, 'amount')} className={bad(`history[${i}].amount`)} /></td>
                  <td><input type="date" value={h.from || ''} onChange={setRow(i, 'from')} /></td>
                  <td><input type="date" value={h.to || ''} onChange={setRow(i, 'to')} /></td>
                  <td><button type="button" className="link" onClick={() => removeRow(i)}>削除</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button type="button" className="btn-outline" onClick={addRow}>＋ 行を追加</button>
          <span className="muted">案件名が空の行は保存しません。</span>
        </div>

        <h2 className="section">勤怠シート・日報・申請フォーム</h2>
        <div className="card pad">
          <div className="grid">
            <label>勤怠シートのURL<input value={form.sheetUrl || ''} onChange={set('sheetUrl')} placeholder="https://docs.google.com/spreadsheets/d/…" className={bad('sheetUrl')} />
              <small>{isNew ? '空なら、ひな型から新しく作ります。既存のシートを使うときはURLを貼ってください' : '既存の別のスプレッドシートに差し替えるときは、そのURLを貼って保存します'}</small>{err('sheetUrl')}</label>
            <label>個人フォルダのURL（任意）<input value={form.folderUrl || ''} onChange={set('folderUrl')} placeholder="https://drive.google.com/drive/folders/…" className={bad('folderUrl')} />{err('folderUrl')}</label>
            <label>日報のURL（スプレッドシート）<input value={form.dailyReportUrl || ''} onChange={set('dailyReportUrl')} placeholder="https://docs.google.com/spreadsheets/d/…" className={bad('dailyReportUrl')} />{err('dailyReportUrl')}</label>
            <label>交通費・経費フォームのURL（Googleフォーム）<input value={form.expenseFormUrl || ''} onChange={set('expenseFormUrl')} placeholder="https://docs.google.com/forms/… か https://forms.gle/…" className={bad('expenseFormUrl')} />{err('expenseFormUrl')}</label>
            <label>休暇申請フォームのURL（Googleフォーム）<input value={form.leaveFormUrl || ''} onChange={set('leaveFormUrl')} placeholder="https://docs.google.com/forms/… か https://forms.gle/…" className={bad('leaveFormUrl')} />{err('leaveFormUrl')}</label>
          </div>
          {!isNew && (
            <div className="row" style={{ marginTop: 12 }}>
              {data.sheetUrl && <a href={data.sheetUrl} target="_blank" rel="noreferrer">勤怠シートを開く</a>}
              {data.folderUrl && <a href={data.folderUrl} target="_blank" rel="noreferrer">個人フォルダを開く</a>}
              {form.dailyReportUrl && <a href={form.dailyReportUrl} target="_blank" rel="noreferrer">日報を開く</a>}
              {form.expenseFormUrl && <a href={form.expenseFormUrl} target="_blank" rel="noreferrer">交通費・経費フォームを開く</a>}
              {form.leaveFormUrl && <a href={form.leaveFormUrl} target="_blank" rel="noreferrer">休暇申請フォームを開く</a>}
              <span className="muted">本人への共有：</span><span className={'tag ' + (data.shareState === '共有済み' ? 'ok' : 'wait')}>{data.shareState}</span>
            </div>
          )}
        </div>

        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn" disabled={busy}>{isNew ? '登録する' : '変更を保存'}</button>
          <Link className="btn-sub" to="/employees">キャンセル</Link>
        </div>
      </form>

      {!isNew && <div style={{ marginTop: 14 }}><button className="btn-sub" onClick={recreate}>ひな型から勤怠シートを作り直す</button></div>}
    </>
  )
}
