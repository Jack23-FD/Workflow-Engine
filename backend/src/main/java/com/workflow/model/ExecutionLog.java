package com.workflow.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "execution_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id")
    private Execution execution;

    private String stepName;
    private String stepType;

    @Column(columnDefinition = "JSON")
    private String evaluatedRules;

    private String selectedNextStep;
    private String status;
    private String approverId;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    private LocalDateTime startedAt;

    private LocalDateTime endedAt;
}
