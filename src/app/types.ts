import { Dispatch, SetStateAction, RefObject } from 'react'

export interface AnalysisResponse {
  formattedAnalysis: string;
  initialAnalysis?: string;
}

export interface FormData {
  website: string;
  description: string;
  resume: string;
}

export interface CommonProps {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export interface JobAnalysisFormProps extends CommonProps {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  setAnalysis: Dispatch<SetStateAction<AnalysisResponse | null>>;
  analysisRef: RefObject<HTMLDivElement>;
}

export interface AnalysisResultsProps {
  analysis: AnalysisResponse;
  analysisRef: RefObject<HTMLDivElement>;
}

export interface FitAnalysisProps extends CommonProps {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  analysis: AnalysisResponse;
  setFitAnalysis: Dispatch<SetStateAction<string | null>>;
  fitAnalysis: string | null;
  fitAnalysisRef: RefObject<HTMLDivElement>;
}

export interface ResumeGeneratorProps extends CommonProps {
  formData: FormData;
  analysis: AnalysisResponse;
  fitAnalysis: string;
  additionalInfo: string;
  setAdditionalInfo: Dispatch<SetStateAction<string>>;
  setGeneratedResume: Dispatch<SetStateAction<string | null>>;
  generatedResume: string | null;
  resumeRef: RefObject<HTMLDivElement>;
}

export interface CoverLetterGeneratorProps extends CommonProps {
  formData: FormData;
  analysis: AnalysisResponse | null;
  fitAnalysis: string | null;
  additionalInfo: string;
  setGeneratedCoverLetter: Dispatch<SetStateAction<string | null>>;
  generatedCoverLetter: string | null;
  coverLetterRef: RefObject<HTMLDivElement>;
} 