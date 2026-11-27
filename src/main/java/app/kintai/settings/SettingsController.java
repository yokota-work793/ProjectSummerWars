// 担当：指輪（設定画面）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.settings;

import app.kintai.common.ApiMessage;
import app.kintai.common.BusinessException;
import app.kintai.common.Ids;
import app.kintai.employee.EmployeeService;
import app.kintai.expense.ExpenseTotals;
import app.kintai.google.GoogleWorkspace;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/** 設定の API：ひな型・フォルダ・フォーム（既存のものも登録できる）・社労士のメール。画面は frontend/ の React */
@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final AppSettings settings;
    private final GoogleWorkspace google;
    private final EmployeeService employees;

    public SettingsController(AppSettings settings, GoogleWorkspace google, EmployeeService employees) {
        this.settings = settings; this.google = google; this.employees = employees;
    }

    @GetMapping
    public Map<String, String> show() {
        Map<String, String> v = new LinkedHashMap<>();
        AppSettings.KEYS.forEach(k -> v.put(k, settings.get(k)));
        return v;
    }

    /** 保存。errors には、回答シートに足りない列などの注意が入る */
    @PutMapping
    public ApiMessage save(@RequestBody Map<String, String> form) {
        List<String> notes = new ArrayList<>();
        for (String k : AppSettings.KEYS) if (form.containsKey(k)) settings.set(k, form.get(k));
        // フォームの回答シートに、集計に要る列があるかを確かめる
        for (String[] f : new String[][]{{AppSettings.TRANSPORT_SHEET, "交通費"}, {AppSettings.EXPENSE_SHEET, "経費"}}) {
            String url = settings.get(f[0]);
            if (url.isEmpty()) continue;
            try {
                List<List<String>> head = google.readValues(Ids.of(url), "A1:Z1");
                List<String> miss = ExpenseTotals.missingHeaders(head.isEmpty() ? List.of() : head.get(0));
                if (!miss.isEmpty()) notes.add(f[1] + "の回答シートに「" + String.join("」「", miss) + "」の列がありません。列を足してください。");
            } catch (RuntimeException e) {
                notes.add(f[1] + "の回答シートを開けません（URLと、サービスアカウントへの共有を確認してください）。");
            }
        }
        return new ApiMessage("設定を保存しました。", notes);
    }

    /** GAS 版の「社員管理表」から社員を取り込む（切り替え用）。body は {"sheetUrl": "..."} */
    @PostMapping("/import")
    public ApiMessage importFromGas(@RequestBody Map<String, String> body) {
        try { return ApiMessage.of(employees.importFromGas(body.getOrDefault("sheetUrl", ""))); }
        catch (RuntimeException e) { throw new BusinessException("sheetUrl", "取り込めませんでした：" + e.getMessage()); }
    }
}
