import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { debugAPI } from '../api/apiService';

const Panel = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  font-family: monospace;
  font-size: 0.9rem;
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
`;

const Button = styled.button`
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: #0b5ed7;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const StatusItem = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  
  &:before {
    content: "${props => props.$success ? '✅' : '❌'}";
    margin-right: 0.5rem;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
`;

const JsonDisplay = styled.pre`
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin: 0.5rem 0;
`;

const TroubleshootingTip = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  color: #856404;
`;

const SuccessMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  color: #155724;
`;

const DiagnosticPanel = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [troubleshootingTips, setTroubleshootingTips] = useState([]);
  
  useEffect(() => {
    // Generate troubleshooting tips based on the results
    if (results) {
      const tips = [];
      
      if (!results.basicApiConnection) {
        tips.push('Check if the API server is running and accessible.');
        tips.push('Verify CORS settings in the backend to allow requests from this origin.');
      }
      
      if (!results.databaseConnection) {
        tips.push('Verify the database connection string in backend settings.');
        tips.push('Check if the database server is running and accessible from the API server.');
        tips.push('Ensure the database credentials are correct.');
        tips.push('Look at the Railway PostgreSQL dashboard to verify the database status.');
        
        if (results.errors && results.errors.find(e => e.message && e.message.includes('timeout'))) {
          tips.push('Connection timeout indicates network issues between the API server and database.');
        }
        
        if (results.errors && results.errors.find(e => e.message && e.message.includes('authentication'))) {
          tips.push('Authentication failure indicates incorrect username or password.');
        }
      }
      
      setTroubleshootingTips(tips);
    }
  }, [results]);
  
  const runHealthCheck = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const healthResults = await debugAPI.runDetailedHealthCheck();
      setResults(healthResults);
    } catch (err) {
      console.error('Failed to run health check:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const testDatabaseDirectly = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dbResults = await debugAPI.testDatabaseConnection();
      setResults(prev => ({
        ...prev,
        databaseTest: dbResults
      }));
    } catch (err) {
      console.error('Failed to test database:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const formatPostgresUrl = () => {
    if (results?.debugInfo?.database === 'django.db.backends.postgresql') {
      const host = results.debugInfo.request_meta?.HTTP_HOST || 'unknown-host';
      return `postgresql://username:password@${host}:5432/database_name`;
    }
    return null;
  };
  
  return (
    <Panel>
      <Title>API Diagnostic Panel</Title>
      
      <Button onClick={runHealthCheck} disabled={loading}>
        {loading ? 'Running Checks...' : 'Run Health Check'}
      </Button>
      
      <Button onClick={testDatabaseDirectly} disabled={loading}>
        Test Database
      </Button>
      
      {error && (
        <ErrorMessage>Error: {error}</ErrorMessage>
      )}
      
      {results && (
        <ResultsContainer>
          <StatusItem $success={results.basicApiConnection}>
            API Connection: {results.basicApiConnection ? 'Success' : 'Failed'}
          </StatusItem>
          
          <StatusItem $success={results.debugInfoAvailable}>
            Debug Info Endpoint: {results.debugInfoAvailable ? 'Available' : 'Not Available'}
          </StatusItem>
          
          <StatusItem $success={results.databaseConnection}>
            Database Connection: {results.databaseConnection ? 'Success' : 'Failed'}
          </StatusItem>
          
          {results.databaseConnection ? (
            <SuccessMessage>
              <h4>Database Connection Successful</h4>
              <p>The API server can successfully connect to the database.</p>
            </SuccessMessage>
          ) : troubleshootingTips.length > 0 && (
            <TroubleshootingTip>
              <h4>Troubleshooting Tips</h4>
              <ul>
                {troubleshootingTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
              
              {formatPostgresUrl() && (
                <div>
                  <h4>Expected PostgreSQL URL Format:</h4>
                  <code>{formatPostgresUrl()}</code>
                </div>
              )}
            </TroubleshootingTip>
          )}
          
          {results.errors && results.errors.length > 0 && (
            <>
              <h4>Errors:</h4>
              {results.errors.map((err, index) => (
                <ErrorMessage key={index}>
                  {err.test}: {err.message}
                </ErrorMessage>
              ))}
            </>
          )}
          
          {results.debugInfo && (
            <>
              <h4>Debug Info:</h4>
              <JsonDisplay>
                {JSON.stringify(results.debugInfo, null, 2)}
              </JsonDisplay>
            </>
          )}
          
          {results.databaseInfo && (
            <>
              <h4>Database Info:</h4>
              <JsonDisplay>
                {JSON.stringify(results.databaseInfo, null, 2)}
              </JsonDisplay>
            </>
          )}
          
          {results.databaseTest && (
            <>
              <h4>Database Test Results:</h4>
              <JsonDisplay>
                {JSON.stringify(results.databaseTest, null, 2)}
              </JsonDisplay>
              
              {results.databaseTest.possible_cause && (
                <TroubleshootingTip>
                  <h4>Possible Cause:</h4>
                  <p>{results.databaseTest.possible_cause}</p>
                </TroubleshootingTip>
              )}
            </>
          )}
        </ResultsContainer>
      )}
    </Panel>
  );
};

export default DiagnosticPanel; 