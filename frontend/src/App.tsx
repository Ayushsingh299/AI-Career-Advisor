import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from 'contexts/AuthContext';
import Navbar from 'components/Navbar';
import Home from 'pages/Home';
import Assessment from 'pages/Assessment';
import Dashboard from 'pages/Dashboard';
import Login from 'pages/Login';
import Demo from 'pages/Demo';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/demo" element={<Demo />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;