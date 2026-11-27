// 担当：指輪（画面）。Java の API を呼ぶ窓口。画面からは必ずここを通す
// ・ログインは Cookie（セッション）で保つ
// ・安全対策（CSRF）：Java が Cookie「XSRF-TOKEN」に入れた値を、ヘッダー「X-XSRF-TOKEN」で送り返す

function csrfToken() {
  const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return m ? decodeURIComponent(m[1]) : ''
}

/** API のエラー。errors は {入力欄の名前: メッセージ}、status は HTTP の番号 */
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.status = status
    this.errors = errors || {}
  }
}

async function request(method, url, body, isForm = false) {
  const headers = { 'X-XSRF-TOKEN': csrfToken() }
  let payload
  if (body !== undefined) {
    if (isForm) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
      payload = new URLSearchParams(body)
    } else {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
  }
  const res = await fetch(url, { method, headers, body: payload, credentials: 'same-origin' })
  if (res.status === 401) {
    window.dispatchEvent(new Event('kintai:logout'))
    throw new ApiError(401, 'ログインしてください')
  }
  const text = await res.text()
  const data = text ? safeJson(text) : null
  if (!res.ok) throw new ApiError(res.status, data?.message || `エラーが起きました（${res.status}）`, data?.errors)
  return data
}

function safeJson(text) {
  try { return JSON.parse(text) } catch { return null }
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  del: (url) => request('DELETE', url),
  login: (username, password) => request('POST', '/api/login', { username, password }, true),
  logout: () => request('POST', '/api/logout'),
  me: () => request('GET', '/api/me'),
}
