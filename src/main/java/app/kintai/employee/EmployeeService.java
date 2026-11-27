// 担当：宮谷さん（社員管理）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.employee;

import app.kintai.common.BusinessException;
import app.kintai.common.Ids;
import app.kintai.common.NotFoundException;
import app.kintai.common.TimeText;
import app.kintai.google.GoogleWorkspace;
import app.kintai.settings.AppSettings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/** 社員の登録・変更・削除と、勤怠シート・個人フォルダの作成・共有 */
@Service
public class EmployeeService {
    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);
    private final EmployeeRepository repo;
    private final GoogleWorkspace google;
    private final AppSettings settings;

    public EmployeeService(EmployeeRepository repo, GoogleWorkspace google, AppSettings settings) {
        this.repo = repo; this.google = google; this.settings = settings;
    }

    @Transactional(readOnly = true)
    public List<Employee> list(String q, String status) {
        String query = q == null || q.isBlank() ? null : q.trim();
        String st = status == null || status.isBlank() || "すべて".equals(status) ? null : status;
        return repo.search(query, st);
    }

    @Transactional(readOnly = true)
    public Employee get(String no) {
        Employee e = find(no);
        e.getAssignments().size(); // 画面で使うので読み込んでおく
        return e;
    }

    @Transactional(readOnly = true)
    public EmployeeForm toForm(String no) {
        Employee e = find(no);
        EmployeeForm f = new EmployeeForm();
        f.setNo(e.getEmployeeNo()); f.setName(e.getName()); f.setKana(e.getKana()); f.setMail(e.getEmail());
        f.setDept(e.getDepartment()); f.setType(e.getEmploymentType()); f.setJoined(e.getJoinedOn()); f.setStatus(e.getStatus());
        f.setPayType(e.getPayType()); f.setBase(e.getBaseSalary()); f.setStdTime(TimeText.format(e.getStandardMinutes()));
        f.setCommute(e.getCommuteAllowance()); f.setHousing(e.getHousingAllowance()); f.setFixed(e.getFixedAllowance());
        f.setFixedName(e.getFixedAllowanceName());
        f.setSheetUrl(e.getSheetUrl() == null ? "" : e.getSheetUrl()); f.setFolderUrl(e.getFolderUrl() == null ? "" : e.getFolderUrl());
        e.getAssignments().forEach(a -> f.getHistory().add(new EmployeeForm.AssignmentForm(a.getProjectName(), a.getIncentive(), a.getStartOn(), a.getEndOn())));
        e.getAllowances().forEach(a -> f.getAllowances().add(new EmployeeForm.AllowanceForm(a.getName(), a.getAmount())));
        f.setDailyReportUrl(nv(e.getDailyReportUrl())); f.setExpenseFormUrl(nv(e.getExpenseFormUrl())); f.setLeaveFormUrl(nv(e.getLeaveFormUrl()));
        return f;
    }

    /** 登録。勤怠シートURLが空なら、ひな型をコピーして作る */
    @Transactional
    public String create(EmployeeForm f) {
        if (repo.existsByEmployeeNo(f.getNo().trim())) throw new BusinessException("no", "社員番号「" + f.getNo() + "」はすでに使われています");
        Employee e = new Employee();
        e.setEmployeeNo(f.getNo().trim());
        apply(e, f);
        e.setStatus("在籍");
        String note;
        if (has(f.getSheetUrl())) {
            e.setSheetUrl(f.getSheetUrl().trim());
            e.setFolderUrl(has(f.getFolderUrl()) ? f.getFolderUrl().trim() : null);
            e.setShareState("入社日に共有予定");
            note = "既存の勤怠シートを使います。";
        } else {
            try { provision(e); note = "勤怠シートと個人フォルダを作成しました。"; }
            catch (RuntimeException ex) { note = "ただし勤怠シートの作成に失敗しました（" + ex.getMessage() + "）。「設定」のひな型を確認してください。"; }
        }
        repo.save(e);
        shareIfDue(e);
        return e.getName() + " さんを登録しました。" + note;
    }

    @Transactional
    public String update(String no, EmployeeForm f) {
        Employee e = find(no);
        String oldSheet = e.getSheetUrl();
        apply(e, f);
        e.setStatus(f.getStatus());
        e.setSheetUrl(has(f.getSheetUrl()) ? f.getSheetUrl().trim() : null);
        e.setFolderUrl(has(f.getFolderUrl()) ? f.getFolderUrl().trim() : null);
        e.touch();
        String note = "";
        if (e.getSheetUrl() != null && !e.getSheetUrl().equals(oldSheet)) {
            // 勤怠シートを差し替えた：共有済みなら新しいシートも共有する
            if ("共有済み".equals(e.getShareState())) shareNow(e); else e.setShareState("入社日に共有予定");
            note = "勤怠シートを差し替えました。";
        }
        return e.getName() + " さんの変更を保存しました。" + note;
    }

    /** 退職などで削除：共有を止め、退職者フォルダへ移す（勤怠シートは残す） */
    @Transactional
    public String delete(String no) {
        Employee e = find(no);
        String note = "";
        try {
            if (e.getSheetUrl() != null) google.unshare(Ids.of(e.getSheetUrl()), e.getEmail());
            if (e.getFolderUrl() != null) {
                google.unshare(Ids.of(e.getFolderUrl()), e.getEmail());
                String retired = Ids.of(settings.get(AppSettings.RETIRED_FOLDER));
                if (retired != null) google.moveToFolder(Ids.of(e.getFolderUrl()), retired);
            }
        } catch (RuntimeException ex) { note = "（共有の解除に失敗しました：" + ex.getMessage() + "）"; }
        e.markDeleted();
        return e.getName() + " さんを削除しました。勤怠シートの本人への共有を止めました。" + note;
    }

    /** ひな型から勤怠シートを作り直す */
    @Transactional
    public String recreateSheet(String no) {
        Employee e = find(no);
        provision(e);
        if ("共有済み".equals(e.getShareState())) shareNow(e); else e.setShareState("入社日に共有予定");
        shareIfDue(e);
        return "勤怠シートを作り直しました。";
    }

    /**
     * GAS 版の「社員管理表」から社員を取り込む（切り替え用）。勤怠シート・フォルダ・共有状態はそのまま引き継ぎ、新しくは作らない。
     * すでに同じ社員番号がいる人は取り込まない（何度押しても同じ結果になる）。
     */
    @Transactional
    public String importFromGas(String sheetUrl) {
        String id = Ids.of(sheetUrl);
        if (id == null) throw new BusinessException(null, "社員管理表のURLを入れてください");
        List<EmployeeImport.Row> rows = EmployeeImport.parse(
                google.readValues(id, "'社員一覧'!A1:Z"), google.readValues(id, "'参画履歴'!A1:Z"));
        int added = 0, skipped = 0;
        List<String> ng = new java.util.ArrayList<>();
        for (EmployeeImport.Row r : rows) {
            EmployeeForm f = r.form();
            if (repo.existsByEmployeeNo(f.getNo())) { skipped++; continue; }
            if (f.getName().isEmpty() || f.getMail().isEmpty() || f.getJoined() == null) { ng.add(f.getNo() + "（氏名・メール・入社日のどれかが空）"); continue; }
            Employee e = new Employee();
            e.setEmployeeNo(f.getNo());
            apply(e, f);
            e.setStatus(f.getStatus());
            e.setSheetUrl(has(f.getSheetUrl()) ? f.getSheetUrl() : null);
            e.setFolderUrl(has(f.getFolderUrl()) ? f.getFolderUrl() : null);
            e.setShareState(r.shareState());
            repo.save(e);
            added++;
        }
        return "取り込みました：" + added + "人　すでにいた：" + skipped + "人" + (ng.isEmpty() ? "" : "　取り込めなかった：" + String.join("、", ng));
    }

    /** 毎朝7時：入社日を迎えた社員に勤怠シートを共有する */
    @Scheduled(cron = "0 0 7 * * *", zone = "Asia/Tokyo")
    @Transactional
    public void shareDueSheets() {
        repo.findByDeletedAtIsNullOrderByEmployeeNo().forEach(e -> {
            try { shareIfDue(e); } catch (RuntimeException ex) { log.warn("共有に失敗：{} {}", e.getEmployeeNo(), ex.getMessage()); }
        });
    }

    // ---- 内部 ----
    private void provision(Employee e) {
        String template = Ids.of(settings.get(AppSettings.TEMPLATE_SHEET));
        if (template == null) throw new IllegalStateException("ひな型が未設定です");
        String folderUrl = google.createFolder(e.getEmployeeNo() + "_" + e.getName(), Ids.of(settings.get(AppSettings.ROOT_FOLDER)));
        String sheetUrl = google.copySpreadsheet(template, "勤怠表_" + e.getEmployeeNo() + "_" + e.getName(), Ids.of(folderUrl));
        google.writeCell(Ids.of(sheetUrl), "'テンプレ'!G7", e.getDepartment() == null ? "" : e.getDepartment());
        google.writeCell(Ids.of(sheetUrl), "'テンプレ'!G8", e.getName());
        e.setFolderUrl(folderUrl);
        e.setSheetUrl(sheetUrl);
        if (!"共有済み".equals(e.getShareState())) e.setShareState("入社日に共有予定");
    }

    private void shareIfDue(Employee e) {
        if ("入社日に共有予定".equals(e.getShareState()) && e.getJoinedOn() != null && !e.getJoinedOn().isAfter(LocalDate.now())) shareNow(e);
    }

    private void shareNow(Employee e) {
        if (e.getSheetUrl() == null) return;
        google.share(Ids.of(e.getSheetUrl()), e.getEmail(), "writer");
        if (e.getFolderUrl() != null) google.share(Ids.of(e.getFolderUrl()), e.getEmail(), "reader");
        e.setShareState("共有済み");
    }

    private Employee find(String no) {
        return repo.findByEmployeeNoAndDeletedAtIsNull(no).orElseThrow(() -> new NotFoundException("社員が見つかりません：" + no));
    }

    private void apply(Employee e, EmployeeForm f) {
        e.setName(f.getName().trim());
        e.setKana(f.getKana());
        e.setEmail(f.getMail().trim());
        e.setDepartment(f.getDept());
        e.setEmploymentType(f.getType());
        e.setJoinedOn(f.getJoined());
        e.setPayType(f.getPayType());
        e.setBaseSalary(nz(f.getBase()));
        Integer std = TimeText.toMinutes(f.getStdTime());
        e.setStandardMinutes(std == null ? 480 : std);
        e.setCommuteAllowance(nz(f.getCommute()));
        e.setHousingAllowance(nz(f.getHousing()));
        // 手当：画面の行を保存。行が無く固定手当だけ来たとき（GAS版の取り込みなど）は、それを1行にする
        List<EmployeeForm.AllowanceForm> rows = f.getAllowances().stream().filter(a -> has(a.getName())).toList();
        if (rows.isEmpty() && nz(f.getFixed()) > 0)
            rows = List.of(new EmployeeForm.AllowanceForm(has(f.getFixedName()) ? f.getFixedName().trim() : "固定手当", f.getFixed()));
        e.replaceAllowances(rows.stream().map(a -> new EmployeeAllowance(a.getName().trim(), nz(a.getAmount()))).toList());
        // 月次集計（山川さん）は今までどおり「固定手当」の1列で読むので、合計と名前を入れておく
        e.setFixedAllowance(rows.stream().mapToInt(a -> nz(a.getAmount())).sum());
        String names = String.join("・", rows.stream().map(a -> a.getName().trim()).toList());
        e.setFixedAllowanceName(names.isEmpty() ? null : names.length() > 50 ? names.substring(0, 50) : names);
        e.setDailyReportUrl(blankToNull(f.getDailyReportUrl()));
        e.setExpenseFormUrl(blankToNull(f.getExpenseFormUrl()));
        e.setLeaveFormUrl(blankToNull(f.getLeaveFormUrl()));
        e.replaceAssignments(f.getHistory().stream().filter(h -> has(h.getProject()))
                .map(h -> new ProjectAssignment(h.getProject().trim(), nz(h.getAmount()), h.getFrom(), h.getTo())).toList());
    }

    private static int nz(Integer v) { return v == null ? 0 : v; }
    private static String nv(String v) { return v == null ? "" : v; }
    private static String blankToNull(String v) { return has(v) ? v.trim() : null; }
    private static boolean has(String s) { return s != null && !s.isBlank(); }
}
