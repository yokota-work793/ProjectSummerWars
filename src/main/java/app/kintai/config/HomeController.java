// 担当：指輪（トップ画面）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する。
package app.kintai.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("/") public String home() { return "redirect:/employees"; }
    @GetMapping("/login") public String login() { return "login"; }
}
