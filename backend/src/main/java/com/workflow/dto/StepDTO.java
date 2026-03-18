package com.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StepDTO {
    private UUID id;

    private UUID workflowId;

    @NotBlank(message = "Step name is required")
    private String name;

    @NotBlank(message = "Step type is required")
    private String stepType;

    @NotNull(message = "Step order is required")
    private Integer stepOrder;

    private String metadata;

    private List<RuleResponse> rules;
}
