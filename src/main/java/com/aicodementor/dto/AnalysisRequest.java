package com.aicodementor.dto;

import lombok.Data;

@Data
public class AnalysisRequest {
    private String sourceCode;
    private String language;
}