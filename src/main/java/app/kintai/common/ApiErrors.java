// 担当：全員（共通部品）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/** API のエラーを、画面（React）が読める形 {message, errors:{入力欄の名前: メッセージ}} にそろえる */
@RestControllerAdvice
public class ApiErrors {
    public record ErrorBody(String message, Map<String, String> errors) {}

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> invalid(MethodArgumentNotValidException e) {
        Map<String, String> m = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(f -> m.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new ErrorBody("入力内容を確認してください", m));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorBody> business(BusinessException e) {
        Map<String, String> m = new LinkedHashMap<>();
        if (e.getField() != null) m.put(e.getField(), e.getMessage());
        return ResponseEntity.badRequest().body(new ErrorBody(e.getMessage(), m));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorBody> notFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorBody(e.getMessage(), Map.of()));
    }
}
