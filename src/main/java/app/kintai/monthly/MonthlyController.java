// 担当：山川さん（月次集計・社労士への送付）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.monthly;

import app.kintai.attendance.MonthSheetService;
import app.kintai.common.ApiMessage;
import app.kintai.common.BusinessException;
import app.kintai.google.GoogleWorkspace;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.YearMonth;
import java.util.List;

/** 月次集計の API：月のシート作成 → 集計 → 確認 → CSV（ダウンロード・社労士へ送る）→ 確定。画面は frontend/ の React */
@RestController
@RequestMapping("/api/monthly")
public class MonthlyController {
    private final MonthlyService service;
    private final MonthSheetService sheets;
    private final GoogleWorkspace google;

    public MonthlyController(MonthlyService service, MonthSheetService sheets, GoogleWorkspace google) {
        this.service = service; this.sheets = sheets; this.google = google;
    }

    /** 画面に出すもの（header と rows は MonthlyColumns と同じ並び） */
    public record View(String ym, List<String> header, List<List<String>> rows, boolean fixed, boolean fake) {}

    @GetMapping
    public View show(@RequestParam(required = false) YearMonth ym) {
        YearMonth month = ym != null ? ym : YearMonth.now().minusMonths(1);
        List<MonthlyRecord> list = service.list(month);
        boolean fixed = !list.isEmpty() && list.stream().allMatch(r -> MonthlyRecord.FIXED.equals(r.getStatus()));
        return new View(month.toString(), MonthlyColumns.HEADER, list.stream().map(MonthlyColumns::row).toList(), fixed, google.isFake());
    }

    @PostMapping("/sheets")
    public ApiMessage createSheets(@RequestParam YearMonth ym) {
        var r = sheets.createForAll(ym);
        return new ApiMessage(ym + " のシートを作りました：" + r.made().size() + "人　すでにあった：" + r.skipped().size() + "人", r.failed());
    }

    @PostMapping("/collect")
    public ApiMessage collect(@RequestParam YearMonth ym) {
        var r = service.collect(ym);
        return new ApiMessage(ym + " を集計しました：" + r.ok().size() + "人", r.ng());
    }

    @GetMapping("/csv")
    public ResponseEntity<byte[]> csv(@RequestParam YearMonth ym) {
        byte[] body = service.csv(ym).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("勤怠集計_" + ym + ".csv", StandardCharsets.UTF_8).build().toString())
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8)).body(body);
    }

    @PostMapping("/send")
    public ApiMessage send(@RequestParam YearMonth ym) {
        try { return ApiMessage.of(service.sendCsv(ym)); }
        catch (Exception e) { throw new BusinessException(null, e.getMessage()); }
    }

    @PostMapping("/fix")
    public ApiMessage fix(@RequestParam YearMonth ym) {
        service.fix(ym);
        return ApiMessage.of(ym + " を確定しました。確定した月は集計し直しません。");
    }
}
