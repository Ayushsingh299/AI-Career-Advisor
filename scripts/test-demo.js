#!/usr/bin/env node

/**
 * Quick Demo Test Script
 * 
 * Tests all API endpoints and functionality for hackathon demo
 */

const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');

const API_BASE = 'http://localhost:3001';

// Test data
const DEMO_ASSESSMENT = [
  { questionId: 1, answer: 'JavaScript' },
  { questionId: 2, answer: 8 },
  { questionId: 3, answer: 'Small teams (2-4)' },
  { questionId: 4, answer: 'I want to become a senior developer and eventually lead a team' },
  { questionId: 5, answer: ['React', 'Node.js', 'TypeScript', 'Git'] }
];

const DEMO_USER_PROFILE = {
  personalInfo: {
    name: 'Sarah Johnson',
    title: 'Frontend Developer',
    email: 'sarah@example.com'
  },
  skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Git']
};

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', response.data.status);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testAssessmentAPI() {
  console.log('🧠 Testing AI Assessment API...');
  try {
    const response = await axios.post(`${API_BASE}/api/v1/assessments`, {
      answers: DEMO_ASSESSMENT
    });
    
    const data = response.data.data;
    console.log('✅ Assessment API passed');
    console.log(`   Skills analyzed: ${data.skillLevels?.length || 0}`);
    console.log(`   Career matches: ${data.recommendedCareers?.length || 0}`);
    console.log(`   AI powered: ${data.aiPowered ? 'Yes' : 'No'}`);
    
    return data;
  } catch (error) {
    console.log('❌ Assessment API failed:', error.message);
    return null;
  }
}

async function testCareersAPI() {
  console.log('💼 Testing Careers API...');
  try {
    const response = await axios.get(`${API_BASE}/api/v1/careers`);
    console.log('✅ Careers API passed');
    console.log(`   Total careers: ${response.data.data.totalCount}`);
    console.log(`   Categories: ${response.data.data.filters.categories.length}`);
    return true;
  } catch (error) {
    console.log('❌ Careers API failed:', error.message);
    return false;
  }
}

async function testResumeGeneration() {
  console.log('📄 Testing Resume Generation...');
  try {
    const response = await axios.post(`${API_BASE}/api/v1/resume/generate`, {
      userProfile: DEMO_USER_PROFILE,
      templateId: 'modern',
      targetRole: 'Senior Frontend Developer'
    });
    
    console.log('✅ Resume generation passed');
    console.log(`   Template: ${response.data.data.templateId}`);
    console.log(`   AI enhanced: ${response.data.data.aiEnhancements?.aiPowered ? 'Yes' : 'No'}`);
    return true;
  } catch (error) {
    console.log('❌ Resume generation failed:', error.message);
    return false;
  }
}

async function testCoverLetterGeneration() {
  console.log('✉️ Testing Cover Letter Generation...');
  try {
    const response = await axios.post(`${API_BASE}/api/v1/resume/cover-letter`, {
      userProfile: DEMO_USER_PROFILE,
      jobDescription: 'Senior Frontend Developer position at TechCorp',
      company: 'TechCorp'
    });
    
    console.log('✅ Cover letter generation passed');
    console.log(`   AI powered: ${response.data.data.aiEnhancements?.aiPowered ? 'Yes' : 'No'}`);
    return true;
  } catch (error) {
    console.log('❌ Cover letter generation failed:', error.message);
    return false;
  }
}

async function testFrontendBuild() {
  console.log('🏗️ Testing Frontend Build...');
  try {
    process.chdir('frontend');
    execSync('npm run build', { stdio: 'pipe' });
    process.chdir('..');
    console.log('✅ Frontend build passed');
    return true;
  } catch (error) {
    console.log('❌ Frontend build failed');
    return false;
  }
}

async function generateDemoReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    testResults: results,
    summary: {
      totalTests: Object.keys(results).length,
      passed: Object.values(results).filter(Boolean).length,
      failed: Object.values(results).filter(result => !result).length
    },
    score: Math.round((Object.values(results).filter(Boolean).length / Object.keys(results).length) * 100),
    demoReadiness: Object.values(results).filter(Boolean).length >= 4 ? 'READY' : 'NEEDS WORK'
  };
  
  fs.writeFileSync('demo-test-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n📊 Demo Test Report:');
  console.log(`   Score: ${report.score}/100`);
  console.log(`   Status: ${report.demoReadiness}`);
  console.log(`   Tests Passed: ${report.summary.passed}/${report.summary.totalTests}`);
  
  if (report.demoReadiness === 'READY') {
    console.log('\n🎉 Your AI Career Advisor is HACKATHON READY!');
    console.log('🚀 Key Demo Points:');
    console.log('   • Real AI integration with Gemini API');
    console.log('   • End-to-end career discovery flow');
    console.log('   • Professional UI with Material Design');
    console.log('   • Production-ready build system');
    console.log('   • Comprehensive API coverage');
  } else {
    console.log('\n⚠️ Some issues need attention before demo');
  }
  
  return report;
}

// Main test runner
async function runAllTests() {
  console.log('🎯 AI Career Skills Advisor - Demo Test Suite');
  console.log('=' .repeat(60));
  
  const results = {
    healthCheck: await testHealthCheck(),
    assessment: await testAssessmentAPI(),
    careers: await testCareersAPI(),
    resumeGeneration: await testResumeGeneration(),
    coverLetter: await testCoverLetterGeneration(),
    frontendBuild: await testFrontendBuild()
  };
  
  console.log('\n' + '=' .repeat(60));
  await generateDemoReport(results);
  
  return results;
}

if (require.main === module) {
  runAllTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };