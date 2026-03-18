package com.workflow.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rules", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"step_id", "priority"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private Step step;

    @Column(name = "rule_condition", columnDefinition = "TEXT")
    private String condition;

    @Column(name = "next_step_id")
    private UUID nextStepId;

    @Column(nullable = false)
    private Integer priority;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
