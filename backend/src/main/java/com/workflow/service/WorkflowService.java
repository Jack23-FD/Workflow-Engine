package com.workflow.service;

import com.workflow.dto.RuleResponse;
import com.workflow.dto.StepDTO;
import com.workflow.dto.WorkflowDTO;
import com.workflow.model.Rule;
import com.workflow.model.Step;
import com.workflow.model.Workflow;
import com.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    private void validateJson(String json) {
        if (json == null || json.trim().isEmpty()) return;
        try {
            objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JSON format in Input Schema: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<WorkflowDTO> getAllWorkflows() {
        return workflowRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowDTO getWorkflowById(UUID id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
        return convertToDTO(workflow);
    }

    @Transactional
    public WorkflowDTO createWorkflow(WorkflowDTO dto) {
        validateJson(dto.getInputSchema());
        Workflow workflow = Workflow.builder()
                .name(dto.getName())
                .version(1)
                .isActive(true)
                .inputSchema(dto.getInputSchema())
                .build();
        
        workflow = workflowRepository.save(workflow);
        return convertToDTO(workflow);
    }

    @Transactional
    public WorkflowDTO updateWorkflow(UUID id, WorkflowDTO dto) {
        validateJson(dto.getInputSchema());
        Workflow existing = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
        
        // Increment version for updates
        existing.setName(dto.getName());
        existing.setInputSchema(dto.getInputSchema());
        if (dto.getIsActive() != null) {
            existing.setIsActive(dto.getIsActive());
        }
        existing.setVersion(existing.getVersion() + 1);
        existing.setStartStepId(dto.getStartStepId());
        
        return convertToDTO(workflowRepository.save(existing));
    }

    @Transactional
    public void deleteWorkflow(UUID id) {
        workflowRepository.deleteById(id);
    }

    private WorkflowDTO convertToDTO(Workflow workflow) {
        return WorkflowDTO.builder()
                .id(workflow.getId())
                .name(workflow.getName())
                .version(workflow.getVersion())
                .isActive(workflow.getIsActive())
                .inputSchema(workflow.getInputSchema())
                .startStepId(workflow.getStartStepId())
                .steps(workflow.getSteps().stream().map(this::convertStepToDTO).collect(Collectors.toList()))
                .build();
    }

    private StepDTO convertStepToDTO(Step step) {
        List<RuleResponse> rules = step.getRules() != null ?
                step.getRules().stream()
                        .map(this::convertRuleToResponse)
                        .collect(Collectors.toList()) : null;

        return StepDTO.builder()
                .id(step.getId())
                .workflowId(step.getWorkflow() != null ? step.getWorkflow().getId() : null)
                .name(step.getName())
                .stepType(step.getStepType() != null ? step.getStepType().name() : null)
                .stepOrder(step.getStepOrder())
                .rules(rules)
                .build();
    }

    private RuleResponse convertRuleToResponse(Rule rule) {
        return RuleResponse.builder()
                .id(rule.getId())
                .condition(rule.getCondition())
                .nextStepId(rule.getNextStepId())
                .priority(rule.getPriority())
                .build();
    }
}
