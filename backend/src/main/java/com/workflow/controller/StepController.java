package com.workflow.controller;

import com.workflow.dto.StepDTO;
import com.workflow.service.StepService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StepController {

    private final StepService stepService;

    @GetMapping("/steps/{id}")
    public StepDTO getStep(@PathVariable UUID id) {
        return stepService.getStepById(id);
    }

    @GetMapping("/workflows/{workflowId}/steps")
    public List<StepDTO> getStepsByWorkflow(@PathVariable UUID workflowId) {
        return stepService.getStepsByWorkflow(workflowId);
    }

    @PostMapping("/workflows/{workflowId}/steps")
    public StepDTO addStep(@PathVariable UUID workflowId, @Valid @RequestBody StepDTO dto) {
        return stepService.addStep(workflowId, dto);
    }

    @PutMapping("/steps/{id}")
    public StepDTO updateStep(@PathVariable UUID id, @Valid @RequestBody StepDTO dto) {
        return stepService.updateStep(id, dto);
    }

    @DeleteMapping("/steps/{id}")
    public void deleteStep(@PathVariable UUID id) {
        stepService.deleteStep(id);
    }
}
