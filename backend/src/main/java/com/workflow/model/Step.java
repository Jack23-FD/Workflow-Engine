package com.workflow.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Step {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id")
    private Workflow workflow;

    private String name;

    @Enumerated(EnumType.STRING)
    private StepType stepType;

    private Integer stepOrder;

    @Column(columnDefinition = "JSON")
    private String metadata;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "step", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Rule> rules = new ArrayList<>();

    public enum StepType {
        task, approval, notification
    }
}
