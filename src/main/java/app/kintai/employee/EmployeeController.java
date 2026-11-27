// 担当：宮谷さん（社員管理）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.employee;

import app.kintai.common.ApiMessage;
import app.kintai.common.BusinessException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/** 社員管理の API（画面は frontend/ の React。入力のチェックは EmployeeForm） */
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    static final String HOUSING_NOTE = "在籍7か月以上の社員は 10,000 円";
    private final EmployeeService service;

    public EmployeeController(EmployeeService service) { this.service = service; }

    /** 一覧の1行 */
    public record Summary(String employeeNo, String name, String department, String employmentType, LocalDate joinedOn,
                          String status, int housingAllowance, String shareState) {
        static Summary of(Employee e) {
            return new Summary(e.getEmployeeNo(), e.getName(), e.getDepartment(), e.getEmploymentType(), e.getJoinedOn(),
                    e.getStatus(), e.getHousingAllowance(), e.getShareState());
        }
    }

    /** 登録・詳細画面に出すもの（form が入力欄、それ以外は表示だけ） */
    public record Detail(EmployeeForm form, String name, String kana, String department, String sheetUrl, String folderUrl,
                         String shareState, String housingNote) {}

    @GetMapping
    public List<Summary> list(@RequestParam(defaultValue = "") String q, @RequestParam(defaultValue = "すべて") String status) {
        return service.list(q, status).stream().map(Summary::of).toList();
    }

    @GetMapping("/new")
    public Detail blank() {
        return new Detail(new EmployeeForm().withBlankRows(1), null, null, null, null, null, null, HOUSING_NOTE);
    }

    @GetMapping("/{no}")
    public Detail detail(@PathVariable String no) {
        Employee e = service.get(no);
        return new Detail(service.toForm(no), e.getName(), e.getKana(), e.getDepartment(), e.getSheetUrl(), e.getFolderUrl(),
                e.getShareState(), HOUSING_NOTE);
    }

    @PostMapping
    public ApiMessage create(@Valid @RequestBody EmployeeForm form) { return ApiMessage.of(service.create(form)); }

    @PutMapping("/{no}")
    public ApiMessage update(@PathVariable String no, @Valid @RequestBody EmployeeForm form) {
        return ApiMessage.of(service.update(no, form));
    }

    @DeleteMapping("/{no}")
    public ApiMessage delete(@PathVariable String no) { return ApiMessage.of(service.delete(no)); }

    @PostMapping("/{no}/recreate-sheet")
    public ApiMessage recreate(@PathVariable String no) {
        try { return ApiMessage.of(service.recreateSheet(no)); }
        catch (BusinessException e) { throw e; }
        catch (RuntimeException e) { throw new BusinessException(null, "作り直せませんでした：" + e.getMessage()); }
    }
}
