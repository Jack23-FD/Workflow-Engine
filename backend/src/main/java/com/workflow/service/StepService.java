package com.workflow.service;

import com.workflow.dto.StepDTO;
import com.workflow.model.Step;
import com.workflow.model.Workflow;
import com.workflow.repository.StepRepository;
import com.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StepService {

    private final StepRepository stepRepository;
    private final WorkflowRepository workflowRepository;

    @Transactional(readOnly = true)
    public List<StepDTO> getStepsByWorkflow(UUID workflowId) {
        return stepRepository.findByWorkflowIdOrderByStepOrderAsc(workflowId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public StepDTO addStep(UUID workflowId, StepDTO dto) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow with ID " + workflowId + " not found"));

        Step step = Step.builder()
                .workflow(workflow)
                .name(dto.getName())
                .stepType(Step.StepType.valueOf(dto.getStepType().toLowerCase()))
                .stepOrder(dto.getStepOrder())
                .metadata(dto.getMetadata())
                .build();

        return convertToDTO(stepRepository.save(step));
    }

    @Transactional
    public StepDTO updateStep(UUID id, StepDTO dto) {
        Step existing = stepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Step with ID " + id + " not found"));

        existing.setName(dto.getName());
        existing.setStepType(Step.StepType.valueOf(dto.getStepType().toLowerCase()));
        existing.setStepOrder(dto.getStepOrder());
        existing.setMetadata(dto.getMetadata());

        return convertToDTO(stepRepository.save(existing));
    }

    @Transactional
    public void deleteStep(UUID id) {
        stepRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public StepDTO getStepById(UUID id) {
        Step step = stepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Step with ID " + id + " not found"));
        return convertToDTO(step);
    }

    private StepDTO convertToDTO(Step step) {
        return StepDTO.builder()
                .id(step.getId())
                .workflowId(step.getWorkflow() != null ? step.getWorkflow().getId() : null)
                .name(step.getName())
                .stepType(step.getStepType().name())
                .stepOrder(step.getStepOrder())
                .metadata(step.getMetadata())
                .build();
    }
}
