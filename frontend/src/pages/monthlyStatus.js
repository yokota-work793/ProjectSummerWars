// 担当：指輪（画面）。月次集計の「申請・取込状況」
// いまは仮データ（モック）。実データにするときは、Java の API（/api/monthly）が社員ごとの
// { attendance, expense, leave } を返すようにして、statusOf をその値を返すだけに差し替える。

/** 状態の種類と色（ok＝緑、warn＝黄、bad＝赤、gray＝灰） */
export const LEVEL = {
  反映済: 'ok', 申請なし: 'ok',
  未反映: 'warn', 承認待ち: 'warn', 未確認: 'warn',
  未提出: 'bad', 未申請: 'bad',
  未連携: 'gray',
}
export const needsCheck = (s) => ['warn', 'bad'].includes(LEVEL[s.attendance]) || ['warn', 'bad'].includes(LEVEL[s.expense]) || ['warn', 'bad'].includes(LEVEL[s.leave])

/** 絞り込みの種類 */
export const FILTERS = [
  { key: 'all', label: 'すべて表示' },
  { key: 'issue', label: '申請漏れ・未反映あり（要確認）', test: needsCheck },
  { key: 'attendance', label: '勤怠未反映', test: (s) => LEVEL[s.attendance] !== 'ok' && s.attendance !== '未連携' },
  { key: 'expense', label: '交通費・経費 未申請/未反映', test: (s) => ['warn', 'bad'].includes(LEVEL[s.expense]) },
  { key: 'leave', label: '休暇申請 未申請/未反映', test: (s) => ['warn', 'bad'].includes(LEVEL[s.leave]) },
]

/** 実データの行の状態（まだ連携していないので「未連携」） */
export function statusOf() {
  return { attendance: '未連携', expense: '未連携', leave: '未連携' }
}

/** 仮データ：いろいろな状態の社員を混ぜてある（header は Java の MonthlyColumns と同じ並び） */
export function mockRows(ym) {
  const base = (no, name, dept, days, work, over, comm, house, fixed, fixedName, trans, other) =>
    [ym, no, name, dept, '正社員', '月給', '250000', '8:00', String(days), work, over, '0:00', '0:00', '0:00', '0:00', '0', '0',
      String(comm), String(house), String(fixed), fixedName, '0', '', String(trans), String(other), '集計済み']
  const people = [
    ['E0001', '山田 太郎', '開発部', 10000, 10000, 5000, '資格手当'],
    ['E0002', '佐藤 花子', '開発部', 12000, 0, 0, ''],
    ['E0003', '鈴木 一郎', '営業部', 8000, 10000, 0, ''],
    ['E0004', '高橋 美咲', '総務部', 9000, 0, 0, ''],
    ['E0005', '田中 健', '開発部', 10000, 10000, 10000, '役職手当'],
    ['E0006', '伊藤 さくら', '営業部', 15000, 0, 0, ''],
  ]
  // 月ごとに状態と数字が変わるようにする（同じ月なら毎回同じ）
  const patterns = [
    { attendance: '反映済', expense: '反映済', leave: '申請なし' },
    { attendance: '未提出', expense: '反映済', leave: '反映済' },
    { attendance: '未反映', expense: '未申請', leave: '申請なし' },
    { attendance: '反映済', expense: '承認待ち', leave: '反映済' },
    { attendance: '反映済', expense: '反映済', leave: '未確認' },
    { attendance: '反映済', expense: '反映済', leave: '未申請' },
    { attendance: '反映済', expense: '反映済', leave: '反映済' },
  ]
  const [y, m] = ym.split('-').map(Number)
  const seed = y * 12 + m
  const hm = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`
  return people.map(([no, name, dept, comm, house, fixed, fixedName], i) => {
    const status = patterns[(seed + i * 3) % patterns.length]
    const days = status.attendance === '未提出' ? 0 : 17 + ((seed + i) % 5)
    const over = days ? ((seed * 7 + i * 13) % 20) * 30 : 0
    const trans = status.expense === '反映済' ? ((seed + i) % 4) * 800 : 0
    return { row: base(no, name, dept, days, hm(days * 480 + over), hm(over), comm, house, fixed, fixedName, trans, 0), status }
  })
}

/** カレンダーから集計する年月を決める：1〜15日は前月、16日以降は当月 */
export function autoYm(today = new Date()) {
  const d = new Date(today.getFullYear(), today.getMonth() - (today.getDate() <= 15 ? 1 : 0), 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
export function shiftYm(ym, n) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
