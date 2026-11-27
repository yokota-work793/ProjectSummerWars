// 担当：指輪（画面）。設定（API：/api/settings）
import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Flash } from '../Layout.jsx'

export default function Settings() {
  const [v, setV] = useState(null)
  const [flash, setFlash] = useState({})
  const [sheetUrl, setSheetUrl] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { api.get('/api/settings').then(setV).catch((e) => setFlash({ error: e.message })) }, [])
  if (!v) return <><Flash {...flash} /><p className="muted">読み込み中…</p></>

  const field = (key, label, note, type = 'text') => (
    <label>{label}<input type={type} value={v[key] || ''} onChange={(e) => setV({ ...v, [key]: e.target.value })} />{note && <small>{note}</small>}</label>
  )

  const save = async (e) => {
    e.preventDefault()
    setBusy(true); setFlash({})
    try { const r = await api.put('/api/settings', v); setFlash({ message: r.message, errors: r.errors }) }
    catch (ex) { setFlash({ error: ex.message }) }
    finally { setBusy(false); window.scrollTo(0, 0) }
  }

  const importGas = async (e) => {
    e.preventDefault()
    if (!confirm('GAS 版の社員管理表から社員を取り込みます。すでにいる社員番号は飛ばします。よろしいですか？')) return
    setBusy(true); setFlash({})
    try { const r = await api.post('/api/settings/import', { sheetUrl }); setFlash({ message: r.message }) }
    catch (ex) { setFlash({ error: ex.message }) }
    finally { setBusy(false); window.scrollTo(0, 0) }
  }

  return (
    <>
      <Flash {...flash} />
      <h1>設定</h1>
      <p className="muted lead">Google のファイルは、サービスアカウント（README 参照）に「編集者」で共有してからURLを貼ってください。既存のフォーム・スプレッドシートも、そのまま使えます。</p>
      <form onSubmit={save}>
        <h2 className="section">勤怠シート</h2>
        <div className="card pad grid">
          {field('TEMPLATE_SHEET_URL', '勤怠表のひな型（スプレッドシートURL）', '新しい社員の勤怠シートは、これをコピーして作ります。「テンプレ」シートが必要です')}
          {field('ROOT_FOLDER_URL', '社員フォルダを作る場所（フォルダURL）')}
          {field('RETIRED_FOLDER_URL', '退職者フォルダ（フォルダURL・任意）', '削除した社員のフォルダを移します')}
        </div>
        <h2 className="section">交通費・経費フォーム</h2>
        <div className="card pad grid">
          {field('FORM_TRANSPORT_URL', '交通費フォーム（社員に配るURL）')}
          {field('FORM_TRANSPORT_SHEET_URL', '交通費フォームの回答シート（スプレッドシートURL）')}
          {field('FORM_EXPENSE_URL', '経費フォーム（社員に配るURL）')}
          {field('FORM_EXPENSE_SHEET_URL', '経費フォームの回答シート（スプレッドシートURL）')}
        </div>
        <p className="muted">回答シートには「社員番号」「利用日（日付）」「金額」の質問の列と、山本さんがチェックする「承認」列が必要です（承認の列はシートに自分で足します）。</p>
        <h2 className="section">社労士</h2>
        <div className="card pad grid">
          {field('MAIL_TO', '社労士のメールアドレス', '明細および月次集計のCSVを送る先', 'email')}
        </div>
        <div style={{ marginTop: 18 }}><button className="btn" disabled={busy}>保存</button></div>
      </form>
    </>
  )
}
