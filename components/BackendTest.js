import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { testBackendConnection } from '../services/api';
import supabase from '../services/supabase';

/**
 * Component to test backend connectivity and authentication
 */
const BackendTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [session, setSession] = useState(null);
  
  // Add a log entry
  const addLog = (message, isError = false) => {
    setTestResults(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        message, 
        isError,
        timestamp: new Date().toISOString()
      }
    ]);
  };
  
  // Test backend connection
  const runConnectionTest = async () => {
    addLog('Testing backend connection...');
    try {
      const result = await testBackendConnection();
      if (result.success) {
        addLog(`Connection successful: ${JSON.stringify(result.data)}`);
      } else {
        addLog(`Connection failed: ${result.error.message}`, true);
      }
    } catch (error) {
      addLog(`Test error: ${error.message}`, true);
    }
  };
  
  // Get current session
  const checkSession = async () => {
    addLog('Checking Supabase session...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`Session error: ${error.message}`, true);
        return;
      }
      
      setSession(data.session);
      
      if (data.session) {
        addLog(`Session found: User ID ${data.session.user.id}`);
        addLog(`Token expires: ${new Date(data.session.expires_at * 1000).toLocaleString()}`);
      } else {
        addLog('No active session found', true);
      }
    } catch (error) {
      addLog(`Session check error: ${error.message}`, true);
    }
  };
  
  // Clear logs
  const clearLogs = () => {
    setTestResults([]);
  };
  
  // Run initial tests on component mount
  useEffect(() => {
    const runInitialTests = async () => {
      await checkSession();
      await runConnectionTest();
    };
    
    runInitialTests();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connectivity Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Test Connection" onPress={runConnectionTest} />
        <Button title="Check Session" onPress={checkSession} />
        <Button title="Clear Logs" onPress={clearLogs} />
      </View>
      
      <ScrollView style={styles.logContainer}>
        {testResults.map((log) => (
          <Text 
            key={log.id} 
            style={[styles.logEntry, log.isError && styles.errorLog]}
          >
            [{log.timestamp.split('T')[1].split('.')[0]}] {log.message}
          </Text>
        ))}
        
        {testResults.length === 0 && (
          <Text style={styles.emptyLog}>No test results yet</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logEntry: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorLog: {
    color: 'red',
  },
  emptyLog: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});

export default BackendTest;
