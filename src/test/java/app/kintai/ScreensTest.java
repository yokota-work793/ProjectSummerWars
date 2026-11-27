// 担当：指輪（画面の流れのテスト）。変更する前に src/test/README.md を読み、担当外の人は担当者に相談する
package app.kintai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 画面（React）が使う API の流れ：ログイン → 社員登録 → 月次集計 → CSV（Google は仮データ） */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH")
@AutoConfigureMockMvc
class ScreensTest {
    @Autowired MockMvc mvc;

    @Test
    void ログインしていなければ401() throws Exception {
        mvc.perform(get("/api/employees")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void 開発用のユーザーでログインできる() throws Exception {
        mvc.perform(post("/api/login").with(csrf()).param("username", "demo").param("password", "1111"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/login").with(csrf()).param("username", "demo").param("password", "xxxx"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void 入力が足りないと400と入力欄ごとのエラー() throws Exception {
        mvc.perform(post("/api/employees").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"no\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    @WithMockUser
    void 社員を登録して月次集計まで() throws Exception {
        mvc.perform(get("/api/me")).andExpect(status().isOk());
        mvc.perform(get("/api/employees")).andExpect(status().isOk());
        mvc.perform(get("/api/employees/new")).andExpect(status().isOk()).andExpect(jsonPath("$.housingNote").exists());
        mvc.perform(put("/api/settings").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"TEMPLATE_SHEET_URL\":\"https://docs.google.com/spreadsheets/d/TEMPLATE00000000000000000000000/edit\"}"))
                .andExpect(status().isOk());
        String body = """
                {"no":"E0001","name":"山田 太郎","mail":"taro@example.com","joined":"2025-04-01","type":"正社員","status":"在籍",
                 "payType":"月給","base":250000,"stdTime":"8:00","commute":10000,"housing":10000,
                 "allowances":[{"name":"資格手当","amount":5000},{"name":"","amount":0}],
                 "dailyReportUrl":"https://docs.google.com/spreadsheets/d/REPORT/edit","leaveFormUrl":"https://forms.gle/leave",
                 "history":[{"project":"案件A","amount":30000,"from":null,"to":null}]}
                """;
        mvc.perform(post("/api/employees").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.message").exists());
        mvc.perform(post("/api/employees").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.no").exists());
        mvc.perform(get("/api/employees/E0001")).andExpect(status().isOk())
                .andExpect(jsonPath("$.form.name").value("山田 太郎"))
                .andExpect(jsonPath("$.form.allowances.length()").value(1))          // 名前が空の行は保存しない
                .andExpect(jsonPath("$.form.allowances[0].name").value("資格手当"))
                .andExpect(jsonPath("$.form.leaveFormUrl").value("https://forms.gle/leave"));
        mvc.perform(post("/api/monthly/sheets").with(csrf()).param("ym", "2026-12")).andExpect(status().isOk());
        mvc.perform(post("/api/monthly/collect").with(csrf()).param("ym", "2026-12")).andExpect(status().isOk());
        mvc.perform(get("/api/monthly").param("ym", "2026-12")).andExpect(status().isOk())
                .andExpect(jsonPath("$.rows[0][2]").value("山田 太郎"));   // 3列目＝氏名（MonthlyColumns）
        mvc.perform(get("/api/monthly/csv").param("ym", "2026-12")).andExpect(status().isOk());
        mvc.perform(get("/api/settings")).andExpect(status().isOk());
    }
}
