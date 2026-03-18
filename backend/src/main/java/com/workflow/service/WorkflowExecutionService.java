package com.workflow.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.dto.ExecutionLogResponse;
import com.workflow.dto.ExecutionRequest;
import com.workflow.dto.ExecutionResponse;
import com.workflow.engine.RuleEngine;
import com.workflow.model.*;
import com.workflow.repository.ExecutionLogRepository;
import com.workflow.repository.ExecutionRepository;
import com.workflow.repository.StepRepository;
import com.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowExecutionService {

    private final WorkflowRepository workflowRepository;
    private final StepRepository stepRepository;
    private final ExecutionRepository executionRepository;
    private final ExecutionLogRepository executionLogRepository;
    private final RuleEngine ruleEngine;
    private final ObjectMapper objectMapper;

    @Transactional
    public ExecutionResponse startExecution(UUID workflowId, ExecutionRequest request) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found with id: " + workflowId));

        if (!Boolean.TRUE.equals(workflow.getIsActive())) {
            throw new RuntimeException("Workflow is not active and cannot be executed.");
        }

        if (workflow.getStartStepId() == null) {
            throw new RuntimeException("Workflow has no start step defined. Please configure a first step.");
        }

        // Convert the data map to JSON string for storage
        String inputDataJson;
        try {
            inputDataJson = objectMapper.writeValueAsString(
                request.getData() != null ? request.getData() : java.util.Collections.emptyMap()
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid input data format: " + e.getMessage());
        }

        Execution execution = Execution.builder()
                .workflow(workflow)
                .workflowVersion(workflow.getVersion())
                .status(Execution.Status.in_progress)
                .data(inputDataJson)
                .currentStepId(workflow.getStartStepId())
                .retries(0)
                .triggeredBy(request.getTriggeredBy() != null ? request.getTriggeredBy() : "System")
                .build();

        execution = executionRepository.save(execution);
        log.info("Started execution {} for workflow {}", execution.getId(), workflowId);

        // Run the execution synchronously (loop through steps)
        execution = runExecutionLoop(execution);

        return mapToResponse(execution);
    }

    @Transactional(readOnly = true)
    public Page<ExecutionResponse> getExecutions(int page, int size, String status, UUID workflowId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startedAt"));
        Page<Execution> executionsPage;

        if (status != null && !status.isEmpty() && workflowId != null) {
            Execution.Status execStatus = Execution.Status.valueOf(status.toLowerCase());
            executionsPage = executionRepository.findByWorkflowIdAndStatus(workflowId, execStatus, pageable);
        } else if (status != null && !status.isEmpty()) {
            Execution.Status execStatus = Execution.Status.valueOf(status.toLowerCase());
            executionsPage = executionRepository.findByStatus(execStatus, pageable);
        } else if (workflowId != null) {
            executionsPage = executionRepository.findByWorkflowId(workflowId, pageable);
        } else {
            executionsPage = executionRepository.findAll(pageable);
        }

        return executionsPage.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ExecutionResponse getExecution(UUID executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found: " + executionId));
        return mapToResponse(execution);
    }

    @Transactional
    public ExecutionResponse cancelExecution(UUID executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found: " + executionId));

        if (execution.getStatus() == Execution.Status.completed ||
            execution.getStatus() == Execution.Status.failed ||
            execution.getStatus() == Execution.Status.canceled ||
            execution.getStatus() == Execution.Status.rejected) {
            throw new RuntimeException("Cannot cancel an execution in state: " + execution.getStatus());
        }

        // if there's a pending log, mark it canceled
        List<ExecutionLog> logs = execution.getLogs();
        if (!logs.isEmpty()) {
            ExecutionLog lastLog = logs.get(logs.size() - 1);
            if ("PENDING".equals(lastLog.getStatus())) {
                lastLog.setStatus("CANCELED");
                lastLog.setEndedAt(LocalDateTime.now());
                executionLogRepository.save(lastLog);
            }
        }

        execution.setStatus(Execution.Status.canceled);
        execution.setEndedAt(LocalDateTime.now());
        execution = executionRepository.save(execution);
        log.info("Canceled execution {}", executionId);
        return mapToResponse(execution);
    }

    @Transactional
    public ExecutionResponse retryExecution(UUID executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found: " + executionId));

        if (execution.getStatus() != Execution.Status.failed) {
            throw new RuntimeException("Only failed executions can be retried.");
        }

        execution.setStatus(Execution.Status.in_progress);
        execution.setRetries(execution.getRetries() + 1);
        execution.setEndedAt(null);
        execution = executionRepository.save(execution);

        log.info("Retrying execution {} (attempt {})", executionId, execution.getRetries());
        execution = runExecutionLoop(execution);
        return mapToResponse(execution);
    }

    @Transactional
    public ExecutionResponse approveStep(UUID executionId, String approverId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found: " + executionId));

        if (execution.getStatus() != Execution.Status.pending) {
            throw new RuntimeException("Execution is not awaiting approval.");
        }

        // find the pending log and mark it complete
        List<ExecutionLog> logs = execution.getLogs();
        if (!logs.isEmpty()) {
            ExecutionLog lastLog = logs.get(logs.size() - 1);
            if ("PENDING".equals(lastLog.getStatus())) {
                lastLog.setStatus("COMPLETED");
                lastLog.setApproverId(approverId);
                lastLog.setEndedAt(LocalDateTime.now());
                executionLogRepository.save(lastLog);
            }
        }

        execution.setStatus(Execution.Status.in_progress);
        execution = runExecutionLoop(execution);
        log.info("Execution {} approved by {}", executionId, approverId);
        return mapToResponse(execution);
    }

    @Transactional
    public ExecutionResponse rejectStep(UUID executionId, String approverId, String rejectionReason) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found: " + executionId));

        if (execution.getStatus() != Execution.Status.pending) {
            throw new RuntimeException("Execution is not awaiting approval.");
        }

        // find the pending log and mark it rejected
        List<ExecutionLog> logs = execution.getLogs();
        if (!logs.isEmpty()) {
            ExecutionLog lastLog = logs.get(logs.size() - 1);
            if ("PENDING".equals(lastLog.getStatus())) {
                lastLog.setStatus("REJECTED");
                lastLog.setApproverId(approverId);
                lastLog.setRejectionReason(rejectionReason);
                lastLog.setEndedAt(LocalDateTime.now());
                executionLogRepository.save(lastLog);
            }
        }

        execution.setStatus(Execution.Status.rejected);
        execution.setEndedAt(LocalDateTime.now());
        execution = executionRepository.save(execution);
        log.info("Execution {} rejected by {} with reason: {}", executionId, approverId, rejectionReason);
        return mapToResponse(execution);
    }

    // ====================
    // CORE EXECUTION LOOP
    // ====================
    private Execution runExecutionLoop(Execution execution) {
        int maxSteps = 100; // Safety guard to prevent infinite loops
        int stepCount = 0;

        while (execution.getCurrentStepId() != null && stepCount++ < maxSteps) {
            Step currentStep = stepRepository.findById(execution.getCurrentStepId()).orElse(null);
            if (currentStep == null) {
                log.error("Step {} not found. Marking execution as failed.", execution.getCurrentStepId());
                execution.setStatus(Execution.Status.failed);
                break;
            }

            log.info("Processing step '{}' ({})", currentStep.getName(), currentStep.getId());

            ExecutionLog logEntry = ExecutionLog.builder()
                    .execution(execution)
                    .stepName(currentStep.getName())
                    .stepType(currentStep.getStepType().name())
                    .startedAt(LocalDateTime.now())
                    .status("IN_PROGRESS")
                    .build();

            try {
                // Approval steps pause execution
                if (currentStep.getStepType() == Step.StepType.approval) {
                    log.info("Approval step reached. Pausing execution.");
                    
                    // We just started the approval step, so its log is IN_PROGRESS.
                    // We need it to be PENDING so the UI knows it's waiting for user action.
                    logEntry.setStatus("PENDING");
                    // Do not set endedAt yet.
                    executionLogRepository.save(logEntry);
                    
                    execution.setCurrentStepId(currentStep.getId());
                    execution.setStatus(Execution.Status.pending);
                    executionRepository.save(execution);
                    return execution;
                }

                // Evaluate rules to find the next step for non-approval steps
                UUID nextStepId = ruleEngine.evaluateRules(currentStep.getRules(), execution.getData());

                // Build evaluated rules summary for logging
                String evaluatedRulesSummary = buildRulesSummary(currentStep.getRules());
                String nextStepName = nextStepId != null
                        ? stepRepository.findById(nextStepId).map(Step::getName).orElse(nextStepId.toString())
                        : "END";

                logEntry.setSelectedNextStep(nextStepName);
                logEntry.setEvaluatedRules(evaluatedRulesSummary);
                logEntry.setStatus("COMPLETED");
                logEntry.setEndedAt(LocalDateTime.now());
                executionLogRepository.save(logEntry);

                execution.setCurrentStepId(nextStepId);

            } catch (Exception e) {
                log.error("Error processing step '{}': {}", currentStep.getName(), e.getMessage());
                logEntry.setStatus("FAILED");
                logEntry.setErrorMessage(e.getMessage());
                logEntry.setEndedAt(LocalDateTime.now());
                executionLogRepository.save(logEntry);
                execution.setStatus(Execution.Status.failed);
                executionRepository.save(execution);
                return execution;
            }
        }

        // Execution complete
        if (stepCount >= maxSteps) {
            log.warn("Execution {} hit the max step limit. Possibly a cycle in rules.", execution.getId());
            execution.setStatus(Execution.Status.failed);
        } else if (execution.getStatus() == Execution.Status.in_progress) {
            execution.setStatus(Execution.Status.completed);
        }
        execution.setEndedAt(LocalDateTime.now());
        return executionRepository.save(execution);
    }

    // ===============
    // HELPER METHODS
    // ===============
    private String buildRulesSummary(List<Rule> rules) {
        if (rules == null || rules.isEmpty()) return "[]";
        try {
            List<java.util.Map<String, Object>> summary = rules.stream()
                    .map(r -> {
                        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
                        m.put("priority", r.getPriority());
                        m.put("condition", r.getCondition());
                        m.put("nextStepId", r.getNextStepId());
                        return m;
                    })
                    .collect(Collectors.toList());
            return objectMapper.writeValueAsString(summary);
        } catch (Exception e) {
            return "[]";
        }
    }

    public ExecutionResponse mapToResponse(Execution execution) {
        List<ExecutionLogResponse> logResponses = execution.getLogs().stream()
                .map(this::mapLogToResponse)
                .collect(Collectors.toList());

        String currentStepName = null;
        if (execution.getCurrentStepId() != null) {
            currentStepName = stepRepository.findById(execution.getCurrentStepId())
                    .map(Step::getName).orElse(null);
        }

        Object parsedData = null;
        if (execution.getData() != null) {
            try {
                parsedData = objectMapper.readValue(execution.getData(), Object.class);
            } catch (Exception e) {
                parsedData = execution.getData();
            }
        }

        return ExecutionResponse.builder()
                .id(execution.getId())
                .workflowId(execution.getWorkflow().getId())
                .workflowName(execution.getWorkflow().getName())
                .workflowVersion(execution.getWorkflowVersion())
                .status(execution.getStatus().name())
                .data(parsedData)
                .currentStepId(execution.getCurrentStepId())
                .currentStepName(currentStepName)
                .retries(execution.getRetries())
                .triggeredBy(execution.getTriggeredBy())
                .startedAt(execution.getStartedAt())
                .endedAt(execution.getEndedAt())
                .logs(logResponses)
                .build();
    }

    private ExecutionLogResponse mapLogToResponse(ExecutionLog log) {
        Long durationSeconds = null;
        if (log.getStartedAt() != null && log.getEndedAt() != null) {
            durationSeconds = ChronoUnit.SECONDS.between(log.getStartedAt(), log.getEndedAt());
        }
        return ExecutionLogResponse.builder()
                .id(log.getId())
                .stepName(log.getStepName())
                .stepType(log.getStepType())
                .evaluatedRules(log.getEvaluatedRules())
                .selectedNextStep(log.getSelectedNextStep())
                .status(log.getStatus())
                .approverId(log.getApproverId())
                .errorMessage(log.getErrorMessage())
                .rejectionReason(log.getRejectionReason())
                .startedAt(log.getStartedAt())
                .endedAt(log.getEndedAt())
                .durationSeconds(durationSeconds)
                .build();
    }
}
