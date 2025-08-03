from typing import Dict, List, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

class ResumeJobMatcher:
    def __init__(self):
        """Initialize the matcher with TF-IDF vectorizer"""
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000
        )
    
    def rank(self, resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Rank resume against job description"""
        try:
            # Extract text for similarity comparison
            resume_text = self._extract_resume_text(resume_data)
            job_text = job_data.get('raw_text', '')
            
            # Calculate different similarity scores
            scores = {
                'overall_similarity': self._calculate_text_similarity(resume_text, job_text),
                'skills_match': self._calculate_skills_match(resume_data, job_data),
                'experience_match': self._calculate_experience_match(resume_data, job_data),
                'education_match': self._calculate_education_match(resume_data, job_data),
                'keyword_match': self._calculate_keyword_match(resume_data, job_data)
            }
            
            # Calculate weighted overall score
            overall_score = self._calculate_weighted_score(scores)
            
            # Generate detailed analysis
            analysis = self._generate_analysis(resume_data, job_data, scores)
            
            return {
                'overall_score': overall_score,
                'scores': scores,
                'analysis': analysis,
                'recommendations': self._generate_recommendations(resume_data, job_data, scores)
            }
        except Exception as e:
            print(f"Error in ranking: {str(e)}")
            print(f"Resume data keys: {list(resume_data.keys())}")
            print(f"Job data keys: {list(job_data.keys())}")
            raise e
    
    def _extract_resume_text(self, resume_data: Dict[str, Any]) -> str:
        """Extract relevant text from resume data"""
        text_parts = []
        
        # Add raw text
        if 'raw_text' in resume_data:
            text_parts.append(resume_data['raw_text'])
        
        # Add skills
        if 'skills' in resume_data:
            text_parts.append(' '.join(resume_data['skills']))
        
        # Add experience
        if 'experience' in resume_data:
            for exp in resume_data['experience']:
                if isinstance(exp, dict):
                    # Safely convert dictionary values to strings
                    exp_text = []
                    for key, value in exp.items():
                        if isinstance(value, (str, int, float)):
                            exp_text.append(str(value))
                        elif isinstance(value, dict):
                            # Handle nested dictionaries
                            exp_text.append(' '.join(str(v) for v in value.values() if isinstance(v, (str, int, float))))
                    text_parts.append(' '.join(exp_text))
        
        # Add education
        if 'education' in resume_data:
            for edu in resume_data['education']:
                if isinstance(edu, dict):
                    # Safely convert dictionary values to strings
                    edu_text = []
                    for key, value in edu.items():
                        if isinstance(value, (str, int, float)):
                            edu_text.append(str(value))
                        elif isinstance(value, dict):
                            # Handle nested dictionaries
                            edu_text.append(' '.join(str(v) for v in value.values() if isinstance(v, (str, int, float))))
                    text_parts.append(' '.join(edu_text))
        
        return ' '.join(text_parts)
    
    def _calculate_text_similarity(self, resume_text: str, job_text: str) -> float:
        """Calculate semantic similarity between resume and job description"""
        if not resume_text or not job_text:
            return 0.0
        
        try:
            # Combine texts for vectorization
            combined_texts = [resume_text, job_text]
            tfidf_matrix = self.vectorizer.fit_transform(combined_texts)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except Exception:
            return 0.0
    
    def _calculate_skills_match(self, resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> float:
        """Calculate skills match score"""
        resume_skills = set(resume_data.get('skills', []))
        required_skills = set(job_data.get('required_skills', []))
        preferred_skills = set(job_data.get('preferred_skills', []))
        
        if not required_skills and not preferred_skills:
            return 0.5  # Neutral score if no skills specified
        
        # Calculate required skills match
        required_match = 0.0
        if required_skills:
            required_match = len(resume_skills.intersection(required_skills)) / len(required_skills)
        
        # Calculate preferred skills match (weighted less)
        preferred_match = 0.0
        if preferred_skills:
            preferred_match = len(resume_skills.intersection(preferred_skills)) / len(preferred_skills)
        
        # Weighted average (required skills are more important)
        if required_skills and preferred_skills:
            return (required_match * 0.7) + (preferred_match * 0.3)
        elif required_skills:
            return required_match
        else:
            return preferred_match
    
    def _calculate_experience_match(self, resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> float:
        """Calculate experience level match"""
        job_experience_level = job_data.get('experience_level', 'not_specified')
        
        if job_experience_level == 'not_specified':
            return 0.5
        
        # Simple experience level mapping
        experience_levels = {
            'entry_level': 1,
            'mid_level': 2,
            'senior_level': 3,
            'executive': 4
        }
        
        # Extract experience from resume (simple heuristic)
        resume_experience = self._extract_resume_experience_level(resume_data)
        
        job_level = experience_levels.get(job_experience_level, 2)
        resume_level = experience_levels.get(resume_experience, 2)
        
        # Calculate match score
        level_diff = abs(job_level - resume_level)
        if level_diff == 0:
            return 1.0
        elif level_diff == 1:
            return 0.8
        elif level_diff == 2:
            return 0.6
        else:
            return 0.4
    
    def _extract_resume_experience_level(self, resume_data: Dict[str, Any]) -> str:
        """Extract experience level from resume"""
        text = resume_data.get('raw_text', '').lower()
        
        # Look for experience indicators
        if any(word in text for word in ['senior', 'lead', 'principal', 'architect']):
            return 'senior_level'
        elif any(word in text for word in ['junior', 'entry', 'associate']):
            return 'entry_level'
        elif any(word in text for word in ['director', 'vp', 'cto', 'ceo']):
            return 'executive'
        else:
            return 'mid_level'
    
    def _calculate_education_match(self, resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> float:
        """Calculate education requirements match"""
        job_education = set(job_data.get('education_requirements', []))
        resume_education = resume_data.get('education', [])
        
        if not job_education:
            return 0.5
        
        # Extract education keywords from resume
        resume_edu_keywords = set()
        for edu in resume_education:
            if isinstance(edu, dict):
                for key, value in edu.items():
                    if isinstance(value, (str, int, float)):
                        resume_edu_keywords.update(str(value).lower().split())
                    elif isinstance(value, dict):
                        # Handle nested dictionaries
                        for nested_value in value.values():
                            if isinstance(nested_value, (str, int, float)):
                                resume_edu_keywords.update(str(nested_value).lower().split())
        
        # Calculate match
        matches = 0
        for req in job_education:
            if any(req.lower() in keyword for keyword in resume_edu_keywords):
                matches += 1
        
        return matches / len(job_education) if job_education else 0.0
    
    def _calculate_keyword_match(self, resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> float:
        """Calculate keyword match score"""
        resume_text = resume_data.get('raw_text', '').lower()
        job_text = job_data.get('raw_text', '').lower()
        
        # Extract keywords from job description
        job_keywords = set(re.findall(r'\b\w{4,}\b', job_text))
        
        # Remove common words
        common_words = {'with', 'this', 'that', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'very', 'when', 'your', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'than', 'then', 'them', 'these', 'people', 'may', 'first', 'water', 'been', 'call', 'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'}
        job_keywords = job_keywords - common_words
        
        if not job_keywords:
            return 0.5
        
        # Count matches in resume
        matches = sum(1 for keyword in job_keywords if keyword in resume_text)
        
        return matches / len(job_keywords)
    
    def _calculate_weighted_score(self, scores: Dict[str, float]) -> float:
        """Calculate weighted overall score"""
        weights = {
            'skills_match': 0.35,
            'overall_similarity': 0.25,
            'experience_match': 0.20,
            'keyword_match': 0.15,
            'education_match': 0.05
        }
        
        weighted_score = sum(scores[key] * weights[key] for key in weights.keys())
        return min(1.0, max(0.0, weighted_score))
    
    def _generate_analysis(self, resume_data: Dict[str, Any], job_data: Dict[str, Any], scores: Dict[str, float]) -> Dict[str, Any]:
        """Generate detailed analysis of the match"""
        analysis = {
            'strengths': [],
            'weaknesses': [],
            'missing_skills': [],
            'skill_gaps': {}
        }
        
        # Analyze skills
        resume_skills = set(resume_data.get('skills', []))
        required_skills = set(job_data.get('required_skills', []))
        preferred_skills = set(job_data.get('preferred_skills', []))
        
        # Find missing required skills
        missing_required = required_skills - resume_skills
        if missing_required:
            analysis['missing_skills'].extend(list(missing_required))
            analysis['weaknesses'].append(f"Missing {len(missing_required)} required skills")
        
        # Find matching skills
        matching_required = resume_skills.intersection(required_skills)
        if matching_required:
            analysis['strengths'].append(f"Matches {len(matching_required)} required skills")
        
        matching_preferred = resume_skills.intersection(preferred_skills)
        if matching_preferred:
            analysis['strengths'].append(f"Has {len(matching_preferred)} preferred skills")
        
        # Experience analysis
        if scores['experience_match'] > 0.8:
            analysis['strengths'].append("Experience level well-matched")
        elif scores['experience_match'] < 0.5:
            analysis['weaknesses'].append("Experience level may not match requirements")
        
        return analysis
    
    def _generate_recommendations(self, resume_data: Dict[str, Any], job_data: Dict[str, Any], scores: Dict[str, float]) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        # Skills recommendations
        resume_skills = set(resume_data.get('skills', []))
        required_skills = set(job_data.get('required_skills', []))
        missing_required = required_skills - resume_skills
        
        if missing_required:
            recommendations.append(f"Consider adding these required skills: {', '.join(list(missing_required)[:5])}")
        
        # Experience recommendations
        if scores['experience_match'] < 0.6:
            recommendations.append("Consider highlighting relevant experience or gaining more experience in this field")
        
        # Overall recommendations
        if scores['overall_similarity'] < 0.3:
            recommendations.append("Consider tailoring your resume to better match the job description")
        
        if not recommendations:
            recommendations.append("Your resume appears well-matched for this position!")
        
        return recommendations 