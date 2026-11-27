-- 社員ごとの手当（何個でも足せる）と、日報・交通費経費フォーム・休暇申請フォームのURL
ALTER TABLE employee ADD COLUMN daily_report_url VARCHAR(255);
ALTER TABLE employee ADD COLUMN expense_form_url VARCHAR(255);
ALTER TABLE employee ADD COLUMN leave_form_url   VARCHAR(255);

CREATE TABLE employee_allowance (
  id              BIGSERIAL PRIMARY KEY,
  employee_id     BIGINT      NOT NULL REFERENCES employee(id),
  allowance_name  VARCHAR(50) NOT NULL,
  amount          INTEGER     NOT NULL DEFAULT 0
);
CREATE INDEX idx_allowance_employee ON employee_allowance(employee_id);

-- 今までの「固定手当」を手当の1行目として引き継ぐ
INSERT INTO employee_allowance (employee_id, allowance_name, amount)
SELECT id, COALESCE(NULLIF(fixed_allowance_name, ''), '固定手当'), fixed_allowance FROM employee WHERE fixed_allowance > 0;
