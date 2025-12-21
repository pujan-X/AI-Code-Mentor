package com.aicodementor.dto;

import lombok.Data;

@Data
public class AnalysisResponse {
    private String logicExplanation;
    private String bugs;
    private String optimizedCode;
    private String timeComplexity;
    private String spaceComplexity;
}