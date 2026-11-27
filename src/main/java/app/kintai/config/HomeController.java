// 担当：指輪（トップ画面）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する。
package app.kintai.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.util.Map;

/**
 * 画面は frontend/ の React。本番では React をビルドした index.html を、画面の URL で返す。
 * 開発中は React（http://localhost:5123）が API（このアプリ・5124）を呼ぶ。
 */
@Controller
public class HomeController {
    @GetMapping({"/", "/login", "/employees", "/employees/{no}", "/monthly", "/settings"})
    public String spa() { return "forward:/index.html"; }

    /** ログイン中の人（ログインしていなければ 401） */
    @GetMapping("/api/me")
    @ResponseBody
    public Map<String, String> me(Principal principal) { return Map.of("username", principal.getName()); }
}
