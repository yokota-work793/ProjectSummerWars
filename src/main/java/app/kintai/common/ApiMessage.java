// 担当：全員（共通部品）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.common;

import java.util.List;

/** API の返事（画面に出すメッセージと、人ごとのエラーなどの一覧） */
public record ApiMessage(String message, List<String> errors) {
    public static ApiMessage of(String message) { return new ApiMessage(message, List.of()); }
}
