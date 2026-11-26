//宮谷 test 11/26
// 担当：宮谷さん（社員管理）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.employee;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** 社員（テーブル employee と1対1） */
@Entity
@Table(name = "employee")
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "employee_no", nullable = false, unique = true) private String employeeNo;
    @Column(nullable = false) private String name;
    private String kana;
    @Column(nullable = false) private String email;
    private String department;
    @Column(name = "employment_type") private String employmentType = "正社員";
    @Column(name = "joined_on", nullable = false) private LocalDate joinedOn;
    private String status = "在籍";
    @Column(name = "pay_type") private String payType = "月給";
    @Column(name = "base_salary") private int baseSalary;
    @Column(name = "standard_minutes") private int standardMinutes = 480;
    @Column(name = "commute_allowance") private int commuteAllowance;
    @Column(name = "housing_allowance") private int housingAllowance;
    @Column(name = "fixed_allowance") private int fixedAllowance;
    @Column(name = "fixed_allowance_name") private String fixedAllowanceName;
    @Column(name = "sheet_url") private String sheetUrl;
    @Column(name = "folder_url") private String folderUrl;
    @Column(name = "share_state") private String shareState = "未作成";
    @Column(name = "created_at") private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at") private LocalDateTime updatedAt = LocalDateTime.now();
    @Column(name = "deleted_at") private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startOn ASC")
    private List<ProjectAssignment> assignments = new ArrayList<>();

    public void replaceAssignments(List<ProjectAssignment> list) {
        assignments.clear();
        list.forEach(a -> { a.setEmployee(this); assignments.add(a); });
    }

    public boolean isDeleted() { return deletedAt != null; }

    // ---- getter / setter ----
    public Long getId() { return id; }
    public String getEmployeeNo() { return employeeNo; }
    public void setEmployeeNo(String v) { employeeNo = v; }
    public String getName() { return name; }
    public void setName(String v) { name = v; }
    public String getKana() { return kana; }
    public void setKana(String v) { kana = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { email = v; }
    public String getDepartment() { return department; }
    public void setDepartment(String v) { department = v; }
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String v) { employmentType = v; }
    public LocalDate getJoinedOn() { return joinedOn; }
    public void setJoinedOn(LocalDate v) { joinedOn = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public String getPayType() { return payType; }
    public void setPayType(String v) { payType = v; }
    public int getBaseSalary() { return baseSalary; }
    public void setBaseSalary(int v) { baseSalary = v; }
    public int getStandardMinutes() { return standardMinutes; }
    public void setStandardMinutes(int v) { standardMinutes = v; }
    public int getCommuteAllowance() { return commuteAllowance; }
    public void setCommuteAllowance(int v) { commuteAllowance = v; }
    public int getHousingAllowance() { return housingAllowance; }
    public void setHousingAllowance(int v) { housingAllowance = v; }
    public int getFixedAllowance() { return fixedAllowance; }
    public void setFixedAllowance(int v) { fixedAllowance = v; }
    public String getFixedAllowanceName() { return fixedAllowanceName; }
    public void setFixedAllowanceName(String v) { fixedAllowanceName = v; }
    public String getSheetUrl() { return sheetUrl; }
    public void setSheetUrl(String v) { sheetUrl = v; }
    public String getFolderUrl() { return folderUrl; }
    public void setFolderUrl(String v) { folderUrl = v; }
    public String getShareState() { return shareState; }
    public void setShareState(String v) { shareState = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void touch() { updatedAt = LocalDateTime.now(); }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void markDeleted() { deletedAt = LocalDateTime.now(); shareState = "共有停止"; }
    public List<ProjectAssignment> getAssignments() { return assignments; }
}
