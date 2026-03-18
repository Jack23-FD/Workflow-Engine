package com.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Data Transfer Object for Workflow.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDTO {
    private UUID id;

    @jakarta.validation.constraints.NotBlank(message = "Workflow name is required")
    private String name;

    private Integer version;
    private Boolean isActive;
    private String inputSchema;
    private UUID startStepId;
    private List<StepDTO> steps;
}
