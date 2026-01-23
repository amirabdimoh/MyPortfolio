const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkDirectoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

function verifyPortfolio() {
  console.log('🔍 Verifying Portfolio Project Structure...\n');

  const checks = [
    // Backend files
    { type: 'file', path: 'student-api/package.json', description: 'Backend package.json' },
    { type: 'file', path: 'student-api/server.js', description: 'Express server' },
    { type: 'file', path: 'student-api/.env.example', description: 'Environment template' },
    { type: 'file', path: 'student-api/setup-users.js', description: 'User setup script' },
    { type: 'file', path: 'student-api/config/database.js', description: 'Database configuration' },
    { type: 'file', path: 'student-api/config/enhanced-database.sql', description: 'Database schema' },
    
    // Backend controllers
    { type: 'file', path: 'student-api/controllers/adminController.js', description: 'Admin controller' },
    { type: 'file', path: 'student-api/controllers/authController.js', description: 'Auth controller' },
    { type: 'file', path: 'student-api/controllers/studentController.js', description: 'Student controller' },
    { type: 'file', path: 'student-api/controllers/courseController.js', description: 'Course controller' },
    
    // Backend routes
    { type: 'dir', path: 'student-api/routes', description: 'API routes directory' },
    { type: 'file', path: 'student-api/routes/adminRoutes.js', description: 'Admin routes' },
    { type: 'file', path: 'student-api/routes/authRoutes.js', description: 'Auth routes' },
    { type: 'file', path: 'student-api/routes/studentRoutes.js', description: 'Student routes' },
    
    // Frontend files
    { type: 'file', path: 'student-management-system/package.json', description: 'Frontend package.json' },
    { type: 'file', path: 'student-management-system/src/App.tsx', description: 'Main App component' },
    { type: 'file', path: 'student-management-system/tsconfig.json', description: 'TypeScript config' },
    
    // Frontend components
    { type: 'file', path: 'student-management-system/src/components/AdminDashboard.tsx', description: 'Admin dashboard' },
    { type: 'file', path: 'student-management-system/src/components/AdminStudentManagement.tsx', description: 'Student management' },
    { type: 'file', path: 'student-management-system/src/components/Login.tsx', description: 'Login component' },
    { type: 'file', path: 'student-management-system/src/components/StudentForm.tsx', description: 'Student form' },
    { type: 'file', path: 'student-management-system/src/components/StudentTable.tsx', description: 'Student table' },
    
    // Frontend contexts and hooks
    { type: 'file', path: 'student-management-system/src/contexts/AuthContext.tsx', description: 'Auth context' },
    { type: 'file', path: 'student-management-system/src/hooks/useStudents.ts', description: 'Students hook' },
    { type: 'file', path: 'student-management-system/src/types/Student.ts', description: 'Student types' },
    
    // Documentation
    { type: 'file', path: 'student-management-system/README.md', description: 'Main README' },
    { type: 'file', path: 'student-management-system/PORTFOLIO_README.md', description: 'Portfolio README' },
    { type: 'file', path: 'student-management-system/ADMIN_FEATURES_SUMMARY.md', description: 'Admin features doc' },
    { type: 'file', path: 'student-management-system/FIX_SUMMARY.md', description: 'Fix summary doc' },
    { type: 'file', path: 'student-management-system/DEPLOYMENT_CHECKLIST.md', description: 'Deployment checklist' },
    
    // Test files
    { type: 'file', path: 'student-management-system/test-complete-system.js', description: 'System test script' },
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach(check => {
    const exists = check.type === 'file' ? checkFileExists(check.path) : checkDirectoryExists(check.path);
    if (exists) {
      console.log(`✅ ${check.description}`);
      passed++;
    } else {
      console.log(`❌ ${check.description} - Missing: ${check.path}`);
      failed++;
    }
  });

  console.log(`\n📊 Verification Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 Portfolio project structure is complete!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Set up PostgreSQL database');
    console.log('   2. Configure .env file in student-api');
    console.log('   3. Run database setup: psql -U postgres -d student_db -f student-api/config/enhanced-database.sql');
    console.log('   4. Create admin users: node student-api/setup-users.js');
    console.log('   5. Start backend: cd student-api && npm start');
    console.log('   6. Start frontend: cd student-management-system && npm start');
    console.log('   7. Test system: node student-management-system/test-complete-system.js');
    
    console.log('\n📋 Demo Credentials:');
    console.log('   Admin: admin@university.edu / admin123');
    console.log('   Staff: staff@university.edu / staff123');
    
    console.log('\n🌟 Your portfolio project is ready for demonstration!');
  } else {
    console.log('\n⚠️  Some files are missing. Please check the failed items above.');
  }
}

verifyPortfolio();