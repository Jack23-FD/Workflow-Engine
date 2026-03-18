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
public class ExecutionLogResponse {
    private UUID id;
    private String stepName;
    private String stepType;
    private String evaluatedRules;
    private String selectedNextStep;
    private String status;
    private String approverId;
    private String errorMessage;
    private String rejectionReason;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Long durationSeconds;
}
