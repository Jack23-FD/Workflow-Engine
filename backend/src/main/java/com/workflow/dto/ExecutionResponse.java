package com.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResponse {
    private UUID id;
    private UUID workflowId;
    private String workflowName;
    private Integer workflowVersion;
    private String status;
    private Object data; // parsed JSON object for easy use
    private UUID currentStepId;
    private String currentStepName;
    private Integer retries;
    private String triggeredBy;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private List<ExecutionLogResponse> logs;
}
