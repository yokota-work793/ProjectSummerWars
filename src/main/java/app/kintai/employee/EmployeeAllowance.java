// 担当：宮谷さん（社員管理）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.employee;

import jakarta.persistence.*;

/** 社員ごとの手当（資格手当・役職手当など。何個でも足せる） */
@Entity
@Table(name = "employee_allowance")
public class EmployeeAllowance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "employee_id")
    private Employee employee;
    @Column(name = "allowance_name", nullable = false) private String name;
    private int amount;

    protected EmployeeAllowance() {}
    public EmployeeAllowance(String name, int amount) { this.name = name; this.amount = amount; }
    void setEmployee(Employee e) { employee = e; }
    public String getName() { return name; }
    public int getAmount() { return amount; }
}
