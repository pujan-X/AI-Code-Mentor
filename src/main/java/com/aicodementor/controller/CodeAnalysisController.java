package com.aicodementor.controller;

import com.aicodementor.dto.AnalysisRequest;
import com.aicodementor.dto.AnalysisResponse;
import com.aicodementor.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*") // Allows your Frontend to talk to this Backend
public class CodeAnalysisController {

    @Autowired
    private AiService aiService;

    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyze(@RequestBody AnalysisRequest request) {
        AnalysisResponse response = aiService.analyzeCode(request);
        return ResponseEntity.ok(response);
    }
}