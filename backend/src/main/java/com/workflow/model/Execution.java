package com.workflow.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Execution {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id")
    private Workflow workflow;

    private Integer workflowVersion;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(columnDefinition = "JSON")
    private String data;

    private UUID currentStepId;
    private Integer retries;
    private String triggeredBy;

    @CreationTimestamp
    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    @Builder.Default
    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExecutionLog> logs = new ArrayList<>();

    public enum Status {
        pending, in_progress, completed, failed, canceled, rejected
    }
}
