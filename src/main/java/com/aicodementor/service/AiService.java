package com.aicodementor.service;

import com.aicodementor.dto.AnalysisRequest;
import com.aicodementor.dto.AnalysisResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalysisResponse analyzeCode(AnalysisRequest request) {
        // 1. Construct the Prompt
        String prompt = buildPrompt(request);

        // 2. Build Gemini Request JSON Structure
        // Format: { "contents": [{ "parts": [{"text": "..."}] }] }
        Map<String, Object> requestBody = new HashMap<>();
        
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> part = new HashMap<>();
        
        part.put("text", prompt);
        parts.add(part);
        content.put("parts", parts);
        contents.add(content);
        
        requestBody.put("contents", contents);

        // 3. Prepare Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Combine URL with API Key
        String finalUrl = apiUrl + "?key=" + apiKey;

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // 4. Call Gemini API
            System.out.println("🤖 Sending request to Google Gemini...");
            String rawResponse = restTemplate.postForObject(finalUrl, entity, String.class);
            
            // 5. Parse Gemini Response
            return parseGeminiResponse(rawResponse);

        } catch (Exception e) {
            e.printStackTrace();
            AnalysisResponse errorResponse = new AnalysisResponse();
            errorResponse.setLogicExplanation("Error connecting to Gemini API. Check your API Key.");
            return errorResponse;
        }
    }

    private String buildPrompt(AnalysisRequest request) {
        return "You are a Senior Code Mentor. Analyze the following " + request.getLanguage() + " code:\n\n" +
               request.getSourceCode() + "\n\n" +
               "IMPORTANT: Return the response in raw JSON format only (no markdown, no ```json wrappers). " +
               "The JSON must have these exact keys:\n" +
               "- logicExplanation (string)\n" +
               "- bugs (string)\n" +
               "- optimizedCode (string)\n" +
               "- timeComplexity (string)\n" +
               "- spaceComplexity (string)";
    }

    private AnalysisResponse parseGeminiResponse(String rawResponse) {
        try {
            // Gemini JSON structure is deep: candidates[0] -> content -> parts[0] -> text
            JsonNode root = objectMapper.readTree(rawResponse);
            String aiText = root.path("candidates").get(0)
                                .path("content").path("parts").get(0)
                                .path("text").asText();
            
            // Clean up Markdown wrappers if Gemini adds them
            String cleanJson = aiText.replace("```json", "").replace("```", "").trim();
            
            return objectMapper.readValue(cleanJson, AnalysisResponse.class);
        } catch (Exception e) {
            AnalysisResponse fallback = new AnalysisResponse();
            fallback.setLogicExplanation("Failed to parse Gemini response.");
            fallback.setOptimizedCode(rawResponse); // Show raw data for debugging
            return fallback;
        }
    }
}