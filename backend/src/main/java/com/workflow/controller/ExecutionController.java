package com.workflow.controller;

import com.workflow.dto.ExecutionRequest;
import com.workflow.dto.ExecutionResponse;
import com.workflow.service.WorkflowExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import java.util.UUID;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExecutionController {

    private final WorkflowExecutionService executionService;

    /**
     * POST /api/workflows/{workflowId}/execute
     * Start a new workflow execution.
     * Body: { "data": { "amount": 250, "country": "US" }, "triggeredBy": "Web UI" }
     */
    @PostMapping("/workflows/{workflowId}/execute")
    public ResponseEntity<ExecutionResponse> startExecution(
            @PathVariable UUID workflowId,
            @RequestBody ExecutionRequest request) {
        ExecutionResponse response = executionService.startExecution(workflowId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/executions
     * Get paginated executions with optional filters.
     */
    @GetMapping("/executions")
    public ResponseEntity<Page<ExecutionResponse>> getExecutions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID workflowId) {
        return ResponseEntity.ok(executionService.getExecutions(page, size, status, workflowId));
    }

    /**
     * GET /api/executions/{id}
     * Get execution status and logs.
     */
    @GetMapping("/executions/{id}")
    public ResponseEntity<ExecutionResponse> getExecution(@PathVariable UUID id) {
        return ResponseEntity.ok(executionService.getExecution(id));
    }

    /**
     * POST /api/executions/{id}/cancel
     * Cancel a running or pending execution.
     */
    @PostMapping("/executions/{id}/cancel")
    public ResponseEntity<ExecutionResponse> cancelExecution(@PathVariable UUID id) {
        return ResponseEntity.ok(executionService.cancelExecution(id));
    }

    /**
     * POST /api/executions/{id}/retry
     * Retry a failed execution from the current failed step.
     */
    @PostMapping("/executions/{id}/retry")
    public ResponseEntity<ExecutionResponse> retryExecution(@PathVariable UUID id) {
        return ResponseEntity.ok(executionService.retryExecution(id));
    }

    /**
     * POST /api/executions/{id}/approve
     * Approve a pending approval step.
     */
    @PostMapping("/executions/{id}/approve")
    public ResponseEntity<ExecutionResponse> approveStep(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        String approverId = request.getOrDefault("approverId", "SYSTEM");
        return ResponseEntity.ok(executionService.approveStep(id, approverId));
    }
}
