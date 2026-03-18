package com.workflow.controller;

import com.workflow.dto.RuleRequest;
import com.workflow.dto.RuleResponse;
import com.workflow.service.RuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Adjust origin as needed based on your current setup
public class RuleController {

    private final RuleService ruleService;

    @PostMapping("/steps/{stepId}/rules")
    public ResponseEntity<RuleResponse> createRule(
            @PathVariable UUID stepId,
            @Valid @RequestBody RuleRequest request) {
        RuleResponse response = ruleService.createRule(stepId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/steps/{stepId}/rules")
    public ResponseEntity<List<RuleResponse>> getRulesByStep(
            @PathVariable UUID stepId) {
        List<RuleResponse> responses = ruleService.getRulesByStep(stepId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<RuleResponse> updateRule(
            @PathVariable UUID id,
            @Valid @RequestBody RuleRequest request) {
        RuleResponse response = ruleService.updateRule(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(
            @PathVariable UUID id) {
        ruleService.deleteRule(id);
        return ResponseEntity.noContent().build();
    }
}
