import re
from typing import Dict, List, Any
import spacy

class JobParser:
    def __init__(self):
        """Initialize the job parser with NLP model"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # If spaCy model is not installed, we'll use basic text processing
            self.nlp = None
    
    def parse(self, job_description: str) -> Dict[str, Any]:
        """Parse job description and extract structured information"""
        # Clean the text
        cleaned_text = self._clean_text(job_description)
        
        # Extract different sections
        parsed_data = {
            "raw_text": cleaned_text,
            "required_skills": self._extract_required_skills(cleaned_text),
            "preferred_skills": self._extract_preferred_skills(cleaned_text),
            "experience_level": self._extract_experience_level(cleaned_text),
            "education_requirements": self._extract_education_requirements(cleaned_text),
            "responsibilities": self._extract_responsibilities(cleaned_text),
            "benefits": self._extract_benefits(cleaned_text),
            "location_type": self._extract_location_type(cleaned_text),
            "salary_range": self._extract_salary_range(cleaned_text)
        }
        
        return parsed_data
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)]', '', text)
        return text.strip()
    
    def _extract_required_skills(self, text: str) -> List[str]:
        """Extract required skills from job description"""
        required_skills = []
        
        # Technical skills dictionary
        technical_skills = {
            'programming_languages': [
                'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php',
                'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab'
            ],
            'frameworks': [
                'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'fastapi',
                'spring', 'express', 'laravel', 'rails', 'asp.net', 'jquery'
            ],
            'databases': [
                'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle',
                'sqlite', 'mariadb', 'cassandra', 'dynamodb'
            ],
            'cloud_platforms': [
                'aws', 'azure', 'google cloud', 'gcp', 'heroku', 'digitalocean',
                'linode', 'vultr', 'ibm cloud'
            ],
            'tools': [
                'git', 'docker', 'kubernetes', 'jenkins', 'jira', 'confluence',
                'figma', 'sketch', 'adobe', 'photoshop', 'illustrator'
            ],
            'methodologies': [
                'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd',
                'tdd', 'bdd', 'lean', 'six sigma'
            ]
        }
        
        text_lower = text.lower()
        
        # Extract skills by category
        for category, skills in technical_skills.items():
            for skill in skills:
                if skill in text_lower:
                    required_skills.append(skill)
        
        return list(set(required_skills))  # Remove duplicates
    
    def _extract_preferred_skills(self, text: str) -> List[str]:
        """Extract preferred/nice-to-have skills"""
        preferred_skills = []
        
        # Look for phrases that indicate preferred skills
        preferred_indicators = [
            'preferred', 'nice to have', 'bonus', 'plus', 'advantage',
            'would be great', 'ideal', 'optional', 'additional'
        ]
        
        text_lower = text.lower()
        
        # Find sentences with preferred indicators
        sentences = text.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for indicator in preferred_indicators:
                if indicator in sentence_lower:
                    # Extract skills from this sentence
                    skills = self._extract_skills_from_text(sentence)
                    preferred_skills.extend(skills)
        
        return list(set(preferred_skills))
    
    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from a given text"""
        skills = []
        
        # Common technical terms
        technical_terms = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure', 'docker',
            'kubernetes', 'git', 'html', 'css', 'typescript', 'php', 'c++',
            'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r',
            'matlab', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas',
            'numpy', 'django', 'flask', 'fastapi', 'spring', 'express'
        ]
        
        text_lower = text.lower()
        for term in technical_terms:
            if term in text_lower:
                skills.append(term)
        
        return skills
    
    def _extract_experience_level(self, text: str) -> str:
        """Extract required experience level"""
        text_lower = text.lower()
        
        # Experience level patterns
        experience_patterns = {
            'entry_level': ['entry level', 'junior', '0-2 years', '1-2 years', 'recent graduate'],
            'mid_level': ['mid level', 'mid-level', '3-5 years', '4-6 years', 'intermediate'],
            'senior_level': ['senior', '5+ years', '6+ years', '7+ years', 'lead', 'principal'],
            'executive': ['executive', 'director', 'vp', 'cto', 'ceo', 'head of']
        }
        
        for level, patterns in experience_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    return level
        
        return "not_specified"
    
    def _extract_education_requirements(self, text: str) -> List[str]:
        """Extract education requirements"""
        education_requirements = []
        
        # Education keywords
        education_keywords = [
            'bachelor', 'master', 'phd', 'degree', 'diploma', 'certificate',
            'high school', 'associate', 'bachelor\'s', 'master\'s', 'doctorate'
        ]
        
        text_lower = text.lower()
        for keyword in education_keywords:
            if keyword in text_lower:
                education_requirements.append(keyword)
        
        return education_requirements
    
    def _extract_responsibilities(self, text: str) -> List[str]:
        """Extract job responsibilities"""
        responsibilities = []
        
        # Look for responsibility indicators
        responsibility_indicators = [
            'responsible for', 'duties include', 'will be responsible',
            'key responsibilities', 'primary duties', 'job duties',
            'responsibilities include', 'will be expected to'
        ]
        
        text_lower = text.lower()
        sentences = text.split('.')
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for indicator in responsibility_indicators:
                if indicator in sentence_lower:
                    responsibilities.append(sentence.strip())
                    break
        
        return responsibilities
    
    def _extract_benefits(self, text: str) -> List[str]:
        """Extract benefits information"""
        benefits = []
        
        # Common benefits keywords
        benefits_keywords = [
            'health insurance', 'dental insurance', 'vision insurance',
            '401k', 'retirement', 'paid time off', 'pto', 'vacation',
            'sick leave', 'remote work', 'flexible hours', 'bonus',
            'stock options', 'equity', 'professional development',
            'tuition reimbursement', 'gym membership', 'free lunch'
        ]
        
        text_lower = text.lower()
        for benefit in benefits_keywords:
            if benefit in text_lower:
                benefits.append(benefit)
        
        return benefits
    
    def _extract_location_type(self, text: str) -> str:
        """Extract location type (remote, on-site, hybrid)"""
        text_lower = text.lower()
        
        if 'remote' in text_lower:
            return 'remote'
        elif 'hybrid' in text_lower:
            return 'hybrid'
        elif 'on-site' in text_lower or 'onsite' in text_lower:
            return 'on-site'
        else:
            return 'not_specified'
    
    def _extract_salary_range(self, text: str) -> Dict[str, str]:
        """Extract salary range information"""
        salary_info = {}
        
        # Salary patterns
        salary_patterns = [
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*to\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*k',
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*to\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*k'
        ]
        
        text_lower = text.lower()
        
        for pattern in salary_patterns:
            matches = re.findall(pattern, text)
            if matches:
                salary_info['min'] = matches[0][0]
                salary_info['max'] = matches[0][1]
                break
        
        return salary_info 