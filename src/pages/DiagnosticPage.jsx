import React, { useState } from 'react';
import styled from 'styled-components';
import DiagnosticPanel from '../components/DiagnosticPanel';
import { API_URL } from '../api/apiService';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  margin-bottom: 0.75rem;
  display: flex;
  
  strong {
    min-width: 200px;
    font-weight: 600;
  }
`;

const DiagnosticPage = () => {
  // Get environment variables and system info
  const [envInfo] = useState({
    apiUrl: API_URL,
    nodeEnv: import.meta.env.MODE,
    buildTime: new Date().toISOString(),
    browserInfo: navigator.userAgent,
  });
  
  return (
    <Container>
      <Title>API Diagnostics</Title>
      
      <Section>
        <SectionTitle>System Information</SectionTitle>
        <InfoItem>
          <strong>API URL:</strong> {envInfo.apiUrl}
        </InfoItem>
        <InfoItem>
          <strong>Environment:</strong> {envInfo.nodeEnv}
        </InfoItem>
        <InfoItem>
          <strong>Build Time:</strong> {envInfo.buildTime}
        </InfoItem>
        <InfoItem>
          <strong>Browser:</strong> {envInfo.browserInfo}
        </InfoItem>
      </Section>
      
      <Section>
        <SectionTitle>API Health Check</SectionTitle>
        <DiagnosticPanel />
      </Section>
      
      <Section>
        <SectionTitle>Troubleshooting Steps</SectionTitle>
        <ol>
          <li>Check if the API URL is correct</li>
          <li>Verify that the backend server is running</li>
          <li>Check database connection settings</li>
          <li>Ensure CORS is properly configured</li>
          <li>Check for any environment variables that need to be set</li>
        </ol>
      </Section>
    </Container>
  );
};

export default DiagnosticPage; 