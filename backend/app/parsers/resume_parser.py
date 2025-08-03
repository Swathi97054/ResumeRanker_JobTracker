import os
import re
from typing import Dict, List, Any
import PyPDF2
from docx import Document
import spacy

class ResumeParser:
    def __init__(self):
        """Initialize the resume parser with NLP model"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # If spaCy model is not installed, we'll use basic text processing
            self.nlp = None
    
    def parse(self, file_path: str) -> Dict[str, Any]:
        """Parse resume file and extract structured information"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Extract text based on file type
        if file_path.lower().endswith('.pdf'):
            text = self._extract_text_from_pdf(file_path)
        elif file_path.lower().endswith('.docx'):
            text = self._extract_text_from_docx(file_path)
        else:
            raise ValueError("Unsupported file format. Only PDF and DOCX are supported.")
        
        # Parse the extracted text
        return self._parse_resume_text(text)
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            raise Exception(f"Error reading PDF file: {str(e)}")
    
    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            raise Exception(f"Error reading DOCX file: {str(e)}")
    
    def _parse_resume_text(self, text: str) -> Dict[str, Any]:
        """Parse resume text and extract structured information"""
        # Clean the text
        text = self._clean_text(text)
        
        # Split text into sections first
        sections = self._split_into_sections(text)
        
        # Extract different sections
        parsed_data = {
            "raw_text": text,
            "name": self._extract_name(text, sections),
            "contact_info": self._extract_contact_info(text, sections),
            "skills": self._extract_skills(text, sections),
            "experience": self._extract_experience(text, sections),
            "education": self._extract_education(text, sections),
            "summary": self._extract_summary(text, sections),
            "languages": self._extract_languages(text, sections),
            "certifications": self._extract_certifications(text, sections),
            "projects": self._extract_projects(text, sections),
            "hobbies": self._extract_hobbies(text, sections),
            "awards": self._extract_awards(text, sections),
            "personal_details": self._extract_personal_details(text, sections)
        }
        
        return parsed_data
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace but preserve line breaks
        text = re.sub(r'[ \t]+', ' ', text)
        # Remove special characters but keep basic punctuation and @ symbol for emails
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\n@]', '', text)
        return text.strip()
    
    def _split_into_sections(self, text: str) -> Dict[str, str]:
        """Split resume text into sections based on headers"""
        sections = {}
        lines = text.split('\n')
        current_section = "general"
        current_content = []
        
        # Define section keywords
        section_keywords = {
            'contact': ['contact', 'phone', 'email', 'address'],
            'summary': ['career objective', 'objective', 'summary', 'profile'],
            'education': ['education', 'academic', 'qualification'],
            'experience': ['experience', 'work history', 'employment'],
            'skills': ['skills', 'technical skills', 'competencies'],
            'certifications': ['certifications', 'certificates', 'workshop'],
            'languages': ['languages', 'language'],
            'projects': ['projects', 'academic projects', 'project'],
            'strengths': ['strengths', 'strength'],
            'activities': ['activities', 'extra-curricular activities', 'extra curricular'],
            'hobbies': ['hobbies', 'hobby'],
            'awards': ['awards', 'achievements', 'recognition', 'honor'],
            'personal details': ['personal details', 'personal information', 'date of birth', 'gender', 'marital status']
        }
        
        for line in lines:
            line_clean = line.strip()
            if not line_clean:
                continue
            
            # Check if this line is a section header
            line_lower = line_clean.lower()
            found_section = None
            
            for section_name, keywords in section_keywords.items():
                # Check for exact match first, then partial match
                for keyword in keywords:
                    if keyword == line_lower or line_lower.startswith(keyword) or line_lower.endswith(keyword):
                        # Save previous section
                        if current_content:
                            sections[current_section] = '\n'.join(current_content).strip()
                        
                        # Start new section
                        current_section = section_name
                        current_content = []
                        found_section = section_name
                        break
                if found_section:
                    break
            
            # If not a header, add to current section
            if not found_section:
                current_content.append(line_clean)
        
        # Save the last section
        if current_content:
            sections[current_section] = '\n'.join(current_content).strip()
        
        return sections
    
    def _extract_name(self, text: str, sections: Dict[str, str]) -> str:
        """Extract candidate name from resume"""
        lines = text.split('\n')
        
        # Look for name patterns in the first few lines
        for i, line in enumerate(lines[:10]):
            line_clean = line.strip()
            if not line_clean:
                continue
            
            # Name patterns: typically all caps, 2-4 words, no numbers
            if re.match(r'^[A-Z\s]{3,50}$', line_clean):
                # Check if it looks like a name (not all common words)
                words = line_clean.split()
                if 2 <= len(words) <= 4:
                    # Filter out common non-name words
                    common_words = ['RESUME', 'CV', 'CURRICULUM', 'VITAE', 'PERSONAL', 'INFORMATION']
                    if not any(word in line_clean for word in common_words):
                        return line_clean
            
            # Also check for names with some lowercase
            if re.match(r'^[A-Z][a-z]+\s+[A-Z][a-z]+', line_clean):
                return line_clean
            
            # Check for Indian name patterns (like LAKSHMI KODURI)
            if re.match(r'^[A-Z]+\s+[A-Z]+$', line_clean) and len(line_clean.split()) == 2:
                return line_clean
        
        return ""
    
    def _extract_contact_info(self, text: str, sections: Dict[str, str]) -> Dict[str, str]:
        """Extract contact information from resume"""
        contact_info = {}
        
        # First try to get from dedicated contact section
        if 'contact' in sections:
            contact_text = sections['contact']
            # Extract email
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            email_match = re.search(email_pattern, contact_text)
            if email_match:
                contact_info['email'] = email_match.group(0)
            
            # Extract phone
            phone_pattern = r'\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b'
            phone_match = re.search(phone_pattern, contact_text)
            if phone_match:
                contact_info['phone'] = ''.join(phone_match.groups())
            
            # Extract address
            address_pattern = r'Address[:\s]*([^\n]+)'
            address_match = re.search(address_pattern, contact_text, re.IGNORECASE)
            if address_match:
                contact_info['address'] = address_match.group(1).strip()
        
        # Always search in full text for email (most important)
        if 'email' not in contact_info:
            # Search for email in the entire text
            email_patterns = [
                r'\b[A-Za-z0-9._%+-]+@(?:gmail\.com|outlook\.com|yahoo\.com|hotmail\.com|live\.com|msn\.com|aol\.com|icloud\.com|protonmail\.com|zoho\.com|yandex\.com|mail\.com|gmx\.com|fastmail\.com|tutanota\.com|disroot\.org|riseup\.net)\b',
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                r'(?:email|mail):\s*([^\s]+)'
            ]
            
            for pattern in email_patterns:
                email_match = re.search(pattern, text, re.IGNORECASE)
                if email_match:
                    if len(email_match.groups()) > 0:
                        # This is the pattern with capture group
                        potential_email = email_match.group(1)
                        if '@' in potential_email and '.' in potential_email:
                            contact_info['email'] = potential_email
                    else:
                        # This is the pattern without capture group
                        contact_info['email'] = email_match.group(0)
                    break
        
        # If no dedicated section, search in full text for other contact info
        if not contact_info or len(contact_info) <= 1:  # Only email found
            lines = text.split('\n')
            for line in lines:
                line_lower = line.lower()
                
                # Extract phone number (Indian format and international)
                phone_patterns = [
                    r'\b(?:\+?91[-.]?)?[789]\d{9}\b',  # Indian mobile
                    r'\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b',  # US format
                    r'\b[0-9]{10,15}\b'  # Simple 10-15 digit numbers
                ]
                
                for pattern in phone_patterns:
                    phone_match = re.search(pattern, line)
                    if phone_match and 'phone' not in contact_info:
                        if len(phone_match.groups()) > 0:
                            contact_info['phone'] = ''.join(phone_match.groups())
                        else:
                            contact_info['phone'] = phone_match.group(0)
                        break
                
                # Extract address
                if 'address' in line_lower and 'address' not in contact_info:
                    address_match = re.search(r'Address[:\s]*([^\n]+)', line, re.IGNORECASE)
                    if address_match:
                        contact_info['address'] = address_match.group(1).strip()
                    else:
                        # Try to extract address from the same line
                        address_parts = line.split(':')
                        if len(address_parts) > 1:
                            contact_info['address'] = address_parts[1].strip()
        
        return contact_info
    
    def _extract_skills(self, text: str, sections: Dict[str, str]) -> List[str]:
        """Extract skills from resume text"""
        # Common technical skills - expanded for Indian context
        technical_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure', 'docker',
            'kubernetes', 'git', 'html', 'css', 'typescript', 'php', 'c++',
            'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r',
            'matlab', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas',
            'numpy', 'django', 'flask', 'fastapi', 'spring', 'express',
            'junit', 'pytest', 'selenium', 'jenkins', 'ci/cd', 'agile',
            'scrum', 'kanban', 'jira', 'confluence', 'figma', 'sketch',
            'jdbc', 'verilog', 'vlsi', 'core java', 'html', 'css', 'go',
            # Add more Indian context skills
            'microcontroller', 'pcb', 'electronics', 'communication engineering',
            'automatic street lighting', 'wooden toys', 'community service'
        ]
        
        found_skills = []
        
        # First try to extract from skills section
        skills_text = sections.get('skills', '').lower()
        if skills_text:
            for skill in technical_skills:
                if skill in skills_text:
                    found_skills.append(skill)
        
        # If no skills found in skills section, search in entire text
        if not found_skills:
            text_lower = text.lower()
            for skill in technical_skills:
                if skill in text_lower:
                    found_skills.append(skill)
        
        return list(set(found_skills))  # Remove duplicates
    
    def _extract_summary(self, text: str, sections: Dict[str, str]) -> str:
        """Extract summary/career objective - Return full text"""
        summary = ""
        
        # First try to get from dedicated summary section
        if 'summary' in sections:
            summary = sections['summary'].strip()
        elif 'career objective' in sections:
            summary = sections['career objective'].strip()
        elif 'objective' in sections:
            summary = sections['objective'].strip()
        
        # If no dedicated section, search in full text
        if not summary:
            lines = text.split('\n')
            in_summary = False
            summary_lines = []
            
            for i, line in enumerate(lines):
                line_lower = line.lower().strip()
                
                # Check for summary/objective keywords
                if any(keyword in line_lower for keyword in ['career objective', 'objective', 'summary', 'profile']):
                    in_summary = True
                    # Get the content from the same line if it's not just the header
                    if 'career objective' in line_lower and len(line.strip()) > len('career objective'):
                        # Extract text after "career objective"
                        content_start = line_lower.find('career objective') + len('career objective')
                        if content_start < len(line):
                            summary_lines.append(line[content_start:].strip())
                    continue
                
                # Stop if we hit another major section
                if in_summary and any(section in line_lower for section in ['education', 'experience', 'skills', 'certifications', 'languages', 'projects', 'strengths', 'activities', 'hobbies', 'awards', 'achievements', 'personal details']):
                    break
                
                if in_summary and line.strip():
                    summary_lines.append(line.strip())
            
            summary = ' '.join(summary_lines)
        
        return summary.strip()

    def _extract_hobbies(self, text: str, sections: Dict[str, str]) -> List[str]:
        """Extract hobbies and interests"""
        hobbies = []
        
        # First try to get from dedicated hobbies section
        if 'hobbies' in sections:
            hobbies_text = sections['hobbies']
            # Split by common separators
            hobbies = [hobby.strip() for hobby in re.split(r'[,;]', hobbies_text) if hobby.strip()]
        else:
            # Search in full text for hobbies
            lines = text.split('\n')
            for line in lines:
                line_lower = line.lower()
                if 'hobbies' in line_lower or 'interests' in line_lower:
                    # Extract hobbies from this line and next few lines
                    hobbies_text = line
                    for i in range(1, 3):  # Check next 2 lines
                        if i < len(lines):
                            hobbies_text += ' ' + lines[i]
                    # Extract hobbies
                    hobbies = [hobby.strip() for hobby in re.split(r'[,;]', hobbies_text) if hobby.strip()]
                    break
        
        # Filter out email addresses from hobbies
        filtered_hobbies = []
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
        for hobby in hobbies:
            # Check if this hobby contains an email address
            if not re.search(email_pattern, hobby, re.IGNORECASE):
                # Also check for common email keywords
                if not any(keyword in hobby.lower() for keyword in ['@gmail.com', '@outlook.com', '@yahoo.com', '@hotmail.com', 'email:', 'mail:']):
                    filtered_hobbies.append(hobby)
        
        return filtered_hobbies

    def _extract_awards(self, text: str, sections: Dict[str, str]) -> List[str]:
        """Extract awards and achievements"""
        awards = []
        
        # First try to get from dedicated awards section
        if 'awards' in sections:
            awards_text = sections['awards']
            awards = [award.strip() for award in awards_text.split('\n') if award.strip()]
        elif 'achievements' in sections:
            achievements_text = sections['achievements']
            awards = [achievement.strip() for achievement in achievements_text.split('\n') if achievement.strip()]
        else:
            # Search in full text for awards
            lines = text.split('\n')
            for line in lines:
                line_lower = line.lower()
                if any(keyword in line_lower for keyword in ['award', 'achievement', 'recognition', 'honor']):
                    awards.append(line.strip())
        
        return awards

    def _extract_personal_details(self, text: str, sections: Dict[str, str]) -> Dict[str, str]:
        """Extract personal details"""
        personal_details = {}
        
        # First try to get from dedicated personal details section
        if 'personal details' in sections:
            personal_text = sections['personal details']
            # Extract common personal details
            if 'date of birth' in personal_text.lower():
                dob_match = re.search(r'date of birth[:\s]*([^\n]+)', personal_text, re.IGNORECASE)
                if dob_match:
                    personal_details['date_of_birth'] = dob_match.group(1).strip()
            
            if 'gender' in personal_text.lower():
                gender_match = re.search(r'gender[:\s]*([^\n]+)', personal_text, re.IGNORECASE)
                if gender_match:
                    personal_details['gender'] = gender_match.group(1).strip()
            
            if 'marital status' in personal_text.lower():
                marital_match = re.search(r'marital status[:\s]*([^\n]+)', personal_text, re.IGNORECASE)
                if marital_match:
                    personal_details['marital_status'] = marital_match.group(1).strip()
        
        # If no dedicated section, search in full text
        if not personal_details:
            lines = text.split('\n')
            in_personal_section = False
            
            for line in lines:
                line_lower = line.lower().strip()
                
                # Check for personal details section
                if 'personal details' in line_lower:
                    in_personal_section = True
                    continue
                elif in_personal_section and any(section in line_lower for section in ['education', 'experience', 'skills', 'certifications', 'languages', 'projects', 'strengths', 'activities', 'hobbies', 'awards', 'achievements']):
                    break
                
                if in_personal_section and line.strip():
                    # Extract date of birth
                    if 'date of birth' in line_lower:
                        dob_match = re.search(r'date of birth[:\s]*([^\n]+)', line, re.IGNORECASE)
                        if dob_match:
                            personal_details['date_of_birth'] = dob_match.group(1).strip()
                    
                    # Extract gender
                    if 'gender' in line_lower:
                        gender_match = re.search(r'gender[:\s]*([^\n]+)', line, re.IGNORECASE)
                        if gender_match:
                            personal_details['gender'] = gender_match.group(1).strip()
                    
                    # Extract marital status
                    if 'marital status' in line_lower:
                        marital_match = re.search(r'marital status[:\s]*([^\n]+)', line, re.IGNORECASE)
                        if marital_match:
                            personal_details['marital_status'] = marital_match.group(1).strip()
        
        return personal_details

    def _extract_education(self, text: str, sections: Dict[str, str]) -> List[Dict[str, str]]:
        """Extract education information with improved parsing"""
        education = []
        
        # Parse the entire text line by line to find education entries
        lines = text.split('\n')
        current_education = {}
        in_education_section = False
        
        for i, line in enumerate(lines):
            line_clean = line.strip()
            if not line_clean:
                continue
            
            line_lower = line_clean.lower()
            
            # Check if we're entering education section
            if 'education' in line_lower:
                in_education_section = True
                continue
            elif in_education_section and any(section in line_lower for section in ['skills', 'certifications', 'languages', 'projects', 'strengths', 'activities', 'hobbies', 'awards', 'achievements', 'personal details', 'experience']):
                break
            elif not in_education_section:
                continue
            
            # Check for degree patterns - more comprehensive approach
            degree_patterns = [
                r'\b(b\.?\s*tech|bachelor|b\.?\s*e|b\.?\s*sc)\b',
                r'\b(m\.?\s*tech|master|m\.?\s*e|m\.?\s*sc)\b',
                r'\b(diploma|polytechnic)\b',
                r'\b(ph\.?\s*d|doctorate)\b',
                r'\b(schooling|high school|secondary|intermediate|inter)\b',
                r'\b(be|b\.?\s*tech|bachelor)\b',
                r'\b(artificial intelligence|computer science|electronics|mechanical|civil)\b'
            ]
            
            is_degree_line = False
            for pattern in degree_patterns:
                if re.search(pattern, line_lower):
                    is_degree_line = True
                    break
            
            if is_degree_line:
                if current_education:
                    education.append(current_education)
                current_education = {
                    'degree': line_clean,
                    'institution': '',
                    'year': '',
                    'cgpa': '',
                    'percentage': '',
                    'status': ''
                }
                continue
            
            # If we have a current education entry, look for additional details
            if current_education:
                # Check for institution names - more comprehensive keywords
                institution_keywords = [
                    'college', 'university', 'institute', 'school', 'polytechnic', 
                    'engineering', 'medical', 'arts', 'science', 'commerce',
                    'academy', 'center', 'campus', 'university', 'college',
                    'technology', 'vijaya', 'chaitanya', 'jntu', 'nit', 'iit',
                    'high school', 'secondary', 'primary', 'elementary'
                ]
                
                has_institution_keyword = any(keyword in line_lower for keyword in institution_keywords)
                is_not_degree = not any(degree in line_lower for degree in ['b.tech', 'diploma', 'schooling', 'master', 'phd'])
                
                if has_institution_keyword and is_not_degree:
                    # Clean up institution name
                    clean_institution = line_clean
                    
                    # Remove common patterns that shouldn't be part of institution name
                    patterns_to_remove = [
                        r'Percentage\s*[:\-]?\s*[0-9]+',
                        r'CGPA\s*[:\-]?\s*[0-9]+\.[0-9]+',
                        r'\(pursuing\)',
                        r'\d{4}',  # Remove years
                        r'[0-9]+\.[0-9]+',  # Remove CGPA numbers
                        r'[0-9]+%',  # Remove percentage
                        r'pursuing',
                        r'completed',
                        r'ongoing'
                    ]
                    
                    for pattern in patterns_to_remove:
                        clean_institution = re.sub(pattern, '', clean_institution, flags=re.IGNORECASE)
                    
                    # Clean up extra characters
                    clean_institution = clean_institution.replace(',', '').strip()
                    clean_institution = re.sub(r'\s+', ' ', clean_institution)  # Multiple spaces to single
                    
                    if clean_institution and len(clean_institution) > 3:
                        current_education['institution'] = clean_institution
                
                # Check for year - look for 4-digit years
                year_pattern = r'\b(19|20)\d{2}\b'
                year_match = re.search(year_pattern, line_clean)
                if year_match:
                    current_education['year'] = year_match.group(0)
                
                # Check for CGPA with various formats
                cgpa_patterns = [
                    r'CGPA\s*[:\-]?\s*([0-9]+\.[0-9]+)',
                    r'GPA\s*[:\-]?\s*([0-9]+\.[0-9]+)',
                    r'([0-9]+\.[0-9]+)\s*CGPA',
                    r'([0-9]+\.[0-9]+)\s*GPA'
                ]
                
                for pattern in cgpa_patterns:
                    cgpa_match = re.search(pattern, line_clean, re.IGNORECASE)
                    if cgpa_match:
                        current_education['cgpa'] = cgpa_match.group(1)
                        break
                
                # Check for Percentage with various formats
                percentage_patterns = [
                    r'Percentage\s*[:\-]?\s*([0-9]+)',
                    r'([0-9]+)\s*%',
                    r'([0-9]+)\s*percent'
                ]
                
                for pattern in percentage_patterns:
                    percentage_match = re.search(pattern, line_clean, re.IGNORECASE)
                    if percentage_match:
                        current_education['percentage'] = percentage_match.group(1)
                        break
                
                # Check for status
                status_keywords = ['pursuing', 'ongoing', 'in progress', 'current']
                if any(status in line_lower for status in status_keywords):
                    current_education['status'] = 'pursuing'
        
        # Add the last education entry
        if current_education:
            education.append(current_education)
        
        # Post-process to improve accuracy
        for edu in education:
            # If year is still missing, search in nearby lines
            if not edu.get('year') or edu.get('year') == '20':
                # Search in the next few lines after the degree
                degree_line_index = -1
                for idx, line in enumerate(lines):
                    if edu.get('degree', '').lower() in line.lower():
                        degree_line_index = idx
                        break
                
                if degree_line_index != -1:
                    # Search in next 5 lines
                    for j in range(degree_line_index + 1, min(degree_line_index + 6, len(lines))):
                        next_line = lines[j].strip()
                        if next_line:
                            year_match = re.search(r'\b(19|20)\d{2}\b', next_line)
                            if year_match:
                                edu['year'] = year_match.group(0)
                                break
            
            # Clean up institution name if it's too long or contains unwanted text
            institution = edu.get('institution', '')
            if institution:
                # Remove any remaining numbers or unwanted text
                clean_institution = re.sub(r'\d+', '', institution)
                clean_institution = re.sub(r'[^\w\s\-\.]', '', clean_institution)
                clean_institution = clean_institution.strip()
                if clean_institution and len(clean_institution) > 2:
                    edu['institution'] = clean_institution
        
        # Final cleanup - remove entries that are clearly not degrees
        filtered_education = []
        for edu in education:
            degree = edu.get('degree', '').lower()
            # Skip if degree contains percentage or other non-degree text
            if any(skip_word in degree for skip_word in ['percentage', 'cgpa', 'gpa', 'pursuing']):
                continue
            filtered_education.append(edu)
        
        # Mark the highest degree (most recent year) as complete
        if filtered_education:
            # Sort by year (descending) to find the most recent
            def safe_year_sort(edu):
                year = edu.get('year', '0')
                try:
                    return int(year) if year else 0
                except (ValueError, TypeError):
                    return 0
            
            sorted_education = sorted(filtered_education, key=safe_year_sort, reverse=True)
            
            # Mark the highest degree as complete if no status is set
            for edu in sorted_education:
                if not edu.get('status'):
                    edu['status'] = 'completed'
                break  # Only mark the highest one
        
        return filtered_education
    
    def _extract_experience(self, text: str, sections: Dict[str, str]) -> List[Dict[str, str]]:
        """Extract work experience - improved to separate from projects"""
        experience = []
        
        # Look for common job title patterns - expanded for Indian context
        job_titles = [
            'software engineer', 'developer', 'programmer', 'data scientist',
            'analyst', 'manager', 'director', 'lead', 'architect', 'consultant',
            'intern', 'associate', 'senior', 'junior', 'full stack', 'frontend',
            'backend', 'devops', 'qa', 'tester', 'product manager', 'project manager',
            'engineer', 'scientist', 'specialist', 'coordinator', 'assistant',
            # Add Indian context job titles
            'electronics engineer', 'communication engineer', 'hardware engineer',
            'vlsi engineer', 'embedded engineer', 'research assistant'
        ]
        
        # Extract from experience section if available
        experience_text = sections.get('experience', '')
        if experience_text:
            lines = experience_text.split('\n')
            current_experience = {}
            
            for line in lines:
                line_clean = line.strip()
                if not line_clean:
                    continue
                
                line_lower = line_clean.lower()
                
                # Check for job titles
                for title in job_titles:
                    if title in line_lower:
                        if current_experience:
                            experience.append(current_experience)
                        current_experience = {'title': line_clean}
                        break
                
                # Check for date patterns
                date_pattern = r'\b(19|20)\d{2}\b'
                dates = re.findall(date_pattern, line_clean)
                if dates and current_experience:
                    current_experience['dates'] = line_clean
                
                # Check for company names (usually in caps)
                if re.match(r'^[A-Z\s&]+$', line_clean) and len(line_clean) > 3:
                    if current_experience:
                        current_experience['company'] = line_clean
            
            if current_experience:
                experience.append(current_experience)
        
        # If no experience found in section, search entire text but exclude education and project content
        if not experience:
            lines = text.split('\n')
            in_education_section = False
            in_projects_section = False
            in_experience_section = False
            
            for line in lines:
                line_lower = line.lower().strip()
                
                # Skip education section
                if 'education' in line_lower:
                    in_education_section = True
                    in_projects_section = False
                    in_experience_section = False
                    continue
                elif in_education_section and any(section in line_lower for section in ['skills', 'certifications', 'languages', 'projects', 'strengths', 'activities', 'hobbies', 'experience']):
                    in_education_section = False
                
                # Skip projects section
                if 'projects' in line_lower:
                    in_projects_section = True
                    in_education_section = False
                    in_experience_section = False
                    continue
                elif in_projects_section and any(section in line_lower for section in ['skills', 'certifications', 'languages', 'education', 'strengths', 'activities', 'hobbies', 'experience']):
                    in_projects_section = False
                
                # Check for experience section
                if 'experience' in line_lower:
                    in_experience_section = True
                    in_education_section = False
                    in_projects_section = False
                    continue
                elif in_experience_section and any(section in line_lower for section in ['skills', 'certifications', 'languages', 'education', 'projects', 'strengths', 'activities', 'hobbies']):
                    in_experience_section = False
                
                if in_experience_section and not in_education_section and not in_projects_section:
                    # Check if line contains job title and not project-related content
                    for title in job_titles:
                        if title in line_lower and not any(project_word in line_lower for project_word in ['project', 'system', 'application', 'website', 'app', 'detection', 'analysis', 'generator']):
                            experience.append({'title': line.strip()})
                            break
        
        return experience
    
    def _extract_languages(self, text: str, sections: Dict[str, str]) -> List[str]:
        """Extract languages from resume"""
        languages = []
        
        # Common language keywords
        language_keywords = ['english', 'hindi', 'telugu', 'tamil', 'kannada', 'malayalam', 
                           'marathi', 'gujarati', 'bengali', 'punjabi', 'urdu', 'french', 
                           'spanish', 'german', 'chinese', 'japanese', 'korean', 'arabic']
        
        # Extract from languages section if available
        languages_text = sections.get('languages', '')
        if languages_text:
            text_lower = languages_text.lower()
            for lang in language_keywords:
                if lang in text_lower:
                    languages.append(lang.title())
        
        # If no languages found in section, search entire text
        if not languages:
            text_lower = text.lower()
            for lang in language_keywords:
                if lang in text_lower:
                    languages.append(lang.title())
        
        return list(set(languages))  # Remove duplicates
    
    def _extract_certifications(self, text: str, sections: Dict[str, str]) -> List[str]:
        """Extract certifications from resume - exclude projects"""
        certifications = []
        
        # Extract from certifications section if available
        cert_text = sections.get('certifications', '')
        if cert_text:
            lines = cert_text.split('\n')
            for line in lines:
                line_clean = line.strip()
                if line_clean and len(line_clean) > 5:
                    # Clean up certification text
                    cert_clean = line_clean
                    # Remove common prefixes
                    cert_clean = re.sub(r'^certified\s+for\s+', '', cert_clean, flags=re.IGNORECASE)
                    cert_clean = re.sub(r'^certified\s+', '', cert_clean, flags=re.IGNORECASE)
                    # Exclude project-related content
                    if cert_clean and len(cert_clean) > 10 and not any(project_keyword in cert_clean.lower() for project_keyword in ['project', 'system', 'application', 'community service', 'automatic street', 'wooden toys']):
                        certifications.append(cert_clean)
        
        # If no certifications found in section, search entire text
        if not certifications:
            lines = text.split('\n')
            for line in lines:
                line_lower = line.lower().strip()
                if any(keyword in line_lower for keyword in ['certified', 'certification', 'certificate', 'workshop']) and not any(project_keyword in line_lower for project_keyword in ['project', 'system', 'application', 'community service', 'automatic street', 'wooden toys']):
                    cert_clean = line.strip()
                    cert_clean = re.sub(r'^certified\s+for\s+', '', cert_clean, flags=re.IGNORECASE)
                    cert_clean = re.sub(r'^certified\s+', '', cert_clean, flags=re.IGNORECASE)
                    if cert_clean and len(cert_clean) > 10:
                        certifications.append(cert_clean)
        
        return certifications[:10]  # Limit to 10 certifications
    
    def _extract_projects(self, text: str, sections: Dict[str, str]) -> List[Dict[str, str]]:
        """Extract projects from resume - improved parsing to separate from experience"""
        projects = []
        
        # Extract from projects section if available
        projects_text = sections.get('projects', '')
        if projects_text:
            lines = projects_text.split('\n')
            current_project = {}
            
            for line in lines:
                line_clean = line.strip()
                if not line_clean:
                    continue
                
                line_lower = line_clean.lower()
                
                # Check for project keywords - more comprehensive
                project_keywords = [
                    'project', 'system', 'application', 'website', 'app', 
                    'community service', 'automatic street', 'wooden toys',
                    'detection', 'analysis', 'generator', 'identification',
                    'deep learning', 'machine learning', 'ai', 'neural network',
                    'fake news', 'language detection', 'qr code', 'missing child'
                ]
                
                if any(keyword in line_lower for keyword in project_keywords):
                    if current_project:
                        projects.append(current_project)
                    current_project = {'title': line_clean}
                elif current_project:
                    # Add description to current project
                    if 'description' not in current_project:
                        current_project['description'] = line_clean
                    else:
                        current_project['description'] += ' ' + line_clean
            
            if current_project:
                projects.append(current_project)
        
        # If no projects found in section, search entire text
        if not projects:
            lines = text.split('\n')
            in_projects_section = False
            in_experience_section = False
            in_education_section = False
            
            for line in lines:
                line_lower = line.lower().strip()
                
                # Skip education section
                if 'education' in line_lower:
                    in_education_section = True
                    in_projects_section = False
                    in_experience_section = False
                    continue
                elif in_education_section and any(section in line_lower for section in ['skills', 'certifications', 'languages', 'projects', 'strengths', 'activities', 'hobbies', 'experience']):
                    in_education_section = False
                
                # Skip experience section
                if 'experience' in line_lower:
                    in_experience_section = True
                    in_education_section = False
                    in_projects_section = False
                    continue
                elif in_experience_section and any(section in line_lower for section in ['skills', 'certifications', 'languages', 'education', 'projects', 'strengths', 'activities', 'hobbies']):
                    in_experience_section = False
                
                # Check if we're in projects section
                if 'projects' in line_lower:
                    in_projects_section = True
                    in_education_section = False
                    in_experience_section = False
                    continue
                elif in_projects_section and any(section in line_lower for section in ['skills', 'certifications', 'languages', 'education', 'experience', 'strengths', 'activities', 'hobbies']):
                    break
                
                if in_projects_section and not in_education_section and not in_experience_section:
                    project_keywords = [
                        'project', 'system', 'application', 'website', 'app', 
                        'community service', 'automatic street', 'wooden toys',
                        'detection', 'analysis', 'generator', 'identification',
                        'deep learning', 'machine learning', 'ai', 'neural network',
                        'fake news', 'language detection', 'qr code', 'missing child'
                    ]
                    if any(keyword in line_lower for keyword in project_keywords):
                        projects.append({'title': line.strip()})
        
        return projects 