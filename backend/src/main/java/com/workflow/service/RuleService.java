package com.workflow.service;

import com.workflow.dto.RuleRequest;
import com.workflow.dto.RuleResponse;
import com.workflow.model.Rule;
import com.workflow.model.Step;
import com.workflow.repository.RuleRepository;
import com.workflow.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RuleService {

    private final RuleRepository ruleRepository;
    private final StepRepository stepRepository;

    @Transactional
    public RuleResponse createRule(UUID stepId, RuleRequest request) {
        Step step = stepRepository.findById(stepId)
                .orElseThrow(() -> new IllegalArgumentException("Step not found with id: " + stepId));

        validateRuleRequest(stepId, request, null);

        Rule rule = Rule.builder()
                .step(step)
                .condition(request.getCondition())
                .nextStepId(request.getNextStepId())
                .priority(request.getPriority())
                .build();

        Rule savedRule = ruleRepository.save(rule);
        return mapToResponse(savedRule);
    }

    @Transactional(readOnly = true)
    public List<RuleResponse> getRulesByStep(UUID stepId) {
        if (!stepRepository.existsById(stepId)) {
            throw new IllegalArgumentException("Step not found with id: " + stepId);
        }

        return ruleRepository.findByStepIdOrderByPriorityAsc(stepId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RuleResponse updateRule(UUID ruleId, RuleRequest request) {
        Rule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Rule not found with id: " + ruleId));

        validateRuleRequest(rule.getStep().getId(), request, ruleId);

        rule.setCondition(request.getCondition());
        rule.setNextStepId(request.getNextStepId());
        rule.setPriority(request.getPriority());

        Rule updatedRule = ruleRepository.save(rule);
        return mapToResponse(updatedRule);
    }

    @Transactional
    public void deleteRule(UUID ruleId) {
        if (!ruleRepository.existsById(ruleId)) {
            throw new IllegalArgumentException("Rule not found with id: " + ruleId);
        }
        ruleRepository.deleteById(ruleId);
    }

    private void validateRuleRequest(UUID stepId, RuleRequest request, UUID excludeRuleId) {
        // Condition cannot be empty unless it is DEFAULT
        if ("DEFAULT".equalsIgnoreCase(request.getCondition().trim())) {
            request.setCondition("DEFAULT");
        } else if (request.getCondition() == null || request.getCondition().trim().isEmpty()) {
            throw new IllegalArgumentException("Condition cannot be empty unless it is DEFAULT");
        }

        // nextStepId must refer to a valid step, if provided
        if (request.getNextStepId() != null && !stepRepository.existsById(request.getNextStepId())) {
            throw new IllegalArgumentException("Invalid nextStepId: Step does not exist");
        }

        // Priority must be unique inside the same step
        Optional<Rule> existingRuleWithPriority = ruleRepository.findByStepIdAndPriority(stepId, request.getPriority());
        if (existingRuleWithPriority.isPresent() && !existingRuleWithPriority.get().getId().equals(excludeRuleId)) {
            throw new IllegalArgumentException("Priority " + request.getPriority() + " already exists for this step");
        }

        // DEFAULT rule must be the last priority rule
        List<Rule> existingRules = ruleRepository.findByStepIdOrderByPriorityAsc(stepId);
        if ("DEFAULT".equals(request.getCondition())) {
            // Check if any existing non-default rules have a higher or equal priority number (lower priority)
            for (Rule r : existingRules) {
                if (!r.getId().equals(excludeRuleId) && !"DEFAULT".equals(r.getCondition())
                        && r.getPriority() >= request.getPriority()) {
                     throw new IllegalArgumentException("DEFAULT rule must be the lowest priority (highest priority number)");
                }
            }
        } else {
             // If this is not a DEFAULT rule, ensure it's not prioritized lower than an existing DEFAULT rule
             Optional<Rule> defaultRuleOpt = existingRules.stream()
                     .filter(r -> "DEFAULT".equals(r.getCondition()) && !r.getId().equals(excludeRuleId))
                     .findFirst();
             if (defaultRuleOpt.isPresent() && defaultRuleOpt.get().getPriority() <= request.getPriority()) {
                 throw new IllegalArgumentException("Normal rules must have a higher priority (lower priority number) than the DEFAULT rule");
             }
        }
    }

    private RuleResponse mapToResponse(Rule rule) {
        return RuleResponse.builder()
                .id(rule.getId())
                .stepId(rule.getStep().getId())
                .condition(rule.getCondition())
                .nextStepId(rule.getNextStepId())
                .priority(rule.getPriority())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }
}
