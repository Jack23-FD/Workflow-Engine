package com.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleRequest {

    @NotBlank(message = "Condition is required")
    private String condition;

    @NotNull(message = "Priority is required")
    private Integer priority;

    private UUID nextStepId;
}
