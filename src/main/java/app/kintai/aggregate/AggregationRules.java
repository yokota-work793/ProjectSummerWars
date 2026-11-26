// 担当：横田さん（集計ルール）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.aggregate;

import app.kintai.attendance.DayRecord;
import app.kintai.attendance.MonthSheet;

import java.time.DayOfWeek;

/**
 * 集計（計算）ルール。社労士（もしくは山本さん）に確認して、ここを直す（テストは AggregationRulesTest）。
 * 今は仮ルール：
 *  ・平日：1日の勤務が標準時間を超えた分を「残業」
 *  ・土曜：勤務した時間をすべて「土曜出勤」
 *  ・日曜・祝日（「休日」シート）：勤務した時間をすべて「休日出勤」
 *  ・22:00〜翌5:00 は「深夜」（日曜・祝日は「休日深夜」）。休憩は深夜から引かない
 *  ・備考「有給」→1日（「半休」「半日」は0.5日）、「特別休暇」「夏季休暇」→特別休暇1日
 *  ・欠勤は数えない
 */
public final class AggregationRules {
    private AggregationRules() {}

    public static MonthlySummary aggregate(MonthSheet sheet) {
        int days = 0, work = 0, over = 0, night = 0, sat = 0, hol = 0, holNight = 0;
        double paid = 0, special = 0;
        for (DayRecord d : sheet.days()) {
            String note = d.note() == null ? "" : d.note();
            if (note.contains("有給")) paid += note.matches(".*(半休|半日).*") ? 0.5 : 1;
            if (note.matches(".*(特別休暇|夏季休暇).*")) special += 1;
            if (!d.worked()) continue;

            int in = d.clockIn(), out = d.clockOut() <= in ? d.clockOut() + 1440 : d.clockOut();
            int minutes = Math.max(0, out - in - d.breakMinutes());
            int nightMin = overlap(in, out, 0, 300) + overlap(in, out, 1320, 1740) + overlap(in, out, 2760, 3180);
            boolean holiday = d.date().getDayOfWeek() == DayOfWeek.SUNDAY || sheet.holidays().contains(d.date());

            days++; work += minutes;
            if (holiday) { hol += minutes; holNight += nightMin; }
            else {
                night += nightMin;
                if (d.date().getDayOfWeek() == DayOfWeek.SATURDAY) sat += minutes;
                else over += Math.max(0, minutes - sheet.standardMinutes());
            }
        }
        return new MonthlySummary(days, work, over, night, sat, hol, holNight, paid, special);
    }

    private static int overlap(int a1, int a2, int b1, int b2) { return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1)); }
}
