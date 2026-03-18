package com.workflow.controller;

import com.workflow.dto.WorkflowDTO;
import com.workflow.service.WorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    public List<WorkflowDTO> getAllWorkflows() {
        return workflowService.getAllWorkflows();
    }

    @GetMapping("/{id}")
    public WorkflowDTO getWorkflowById(@PathVariable UUID id) {
        return workflowService.getWorkflowById(id);
    }

    @PostMapping
    public WorkflowDTO createWorkflow(@Valid @RequestBody WorkflowDTO dto) {
        return workflowService.createWorkflow(dto);
    }

    @PutMapping("/{id}")
    public WorkflowDTO updateWorkflow(@PathVariable UUID id, @Valid @RequestBody WorkflowDTO dto) {
        return workflowService.updateWorkflow(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkflow(@PathVariable UUID id) {
        workflowService.deleteWorkflow(id);
    }
}
