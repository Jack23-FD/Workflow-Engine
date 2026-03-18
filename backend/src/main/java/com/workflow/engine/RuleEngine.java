package com.workflow.engine;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.model.Rule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class RuleEngine {

    private final ExpressionParser parser = new SpelExpressionParser();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Evaluates rules in priority order and returns the next step UUID.
     * Handles DEFAULT rule as a catch-all fallback.
     * Returns null if no rule matches and no DEFAULT rule exists.
     */
    public UUID evaluateRules(List<Rule> rules, String jsonData) {
        if (rules == null || rules.isEmpty()) {
            return null;
        }

        UUID defaultNextStep = null;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(jsonData, Map.class);
            StandardEvaluationContext context = new StandardEvaluationContext();
            // Expose data fields as SpEL variables e.g. #amount, #country
            context.setVariables(data);

            for (Rule rule : rules) {
                String condition = rule.getCondition();
                if (condition == null || condition.trim().isEmpty()) {
                    continue;
                }

                // Handle DEFAULT rule — always save it as the fallback
                if ("DEFAULT".equalsIgnoreCase(condition.trim())) {
                    defaultNextStep = rule.getNextStepId();
                    log.info("Found DEFAULT rule -> nextStepId: {}", defaultNextStep);
                    continue; // Don't evaluate, just remember it
                }

                String processedCondition = preprocessCondition(condition, data);

                try {
                    Boolean result = parser.parseExpression(processedCondition).getValue(context, Boolean.class);
                    log.info("Evaluating rule {}: [{}] -> result: {}", rule.getId(), condition, result);
                    if (Boolean.TRUE.equals(result)) {
                        log.info("Rule matched -> nextStepId: {}", rule.getNextStepId());
                        return rule.getNextStepId();
                    }
                } catch (Exception e) {
                    log.warn("Error evaluating rule condition '{}': {}", condition, e.getMessage());
                }
            }
        } catch (JsonProcessingException e) {
            log.error("Error parsing input data for rule evaluation: {}", e.getMessage());
            throw new RuntimeException("Invalid execution data JSON: " + e.getMessage());
        }

        // No specific rule matched — use DEFAULT if available
        if (defaultNextStep != null) {
            log.info("No condition matched, using DEFAULT rule -> nextStepId: {}", defaultNextStep);
        } else {
            log.info("No rule matched and no DEFAULT rule found. Workflow will complete.");
        }
        return defaultNextStep;
    }

    /**
     * Pre-processes a condition string:
     * - Auto-prefixes bare field names with # for SpEL variable access
     * - Transforms contains/startsWith/endsWith helper functions
     */
    private String preprocessCondition(String condition, Map<String, Object> data) {
        if (condition == null) return "";
        String processed = condition;

        // Transform helper functions: contains(field, 'val') -> #field.contains('val')
        processed = processed.replaceAll("\\bcontains\\(([^,]+),\\s*(.+?)\\)", "#$1.contains($2)");
        processed = processed.replaceAll("\\bstartsWith\\(([^,]+),\\s*(.+?)\\)", "#$1.startsWith($2)");
        processed = processed.replaceAll("\\bendsWith\\(([^,]+),\\s*(.+?)\\)", "#$1.endsWith($2)");

        // Auto-prefix known data field names with # if they don't already have it
        // This allows users to write conditions like "amount > 100" instead of "#amount > 100"
        if (data != null) {
            for (String key : data.keySet()) {
                // Replace bare 'key' with '#key', but don't double-prefix
                processed = processed.replaceAll("(?<!#)\\b" + key + "\\b", "#" + key);
            }
        }

        log.debug("Processed condition: '{}' -> '{}'", condition, processed);
        return processed;
    }
}
