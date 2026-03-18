package com.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionRequest {
    // The input data fields for the workflow (e.g., amount, country, priority)
    private Map<String, Object> data;
    private String triggeredBy;
}
