package com.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleResponse {

    private UUID id;
    private UUID stepId;
    private String condition;
    private UUID nextStepId;
    private Integer priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
