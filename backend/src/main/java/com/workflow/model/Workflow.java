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
@Table(name = "workflows")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workflow {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private Integer version;
    private Boolean isActive;

    @Column(columnDefinition = "JSON")
    private String inputSchema;

    private UUID startStepId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Step> steps = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Execution> executions = new ArrayList<>();
}
