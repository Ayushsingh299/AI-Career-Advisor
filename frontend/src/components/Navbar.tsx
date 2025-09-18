import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { School, AccountCircle } from '@mui/icons-material';
import { useAuth } from 'contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <School sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Career Skills Advisor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/demo"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
            }}
          >
            🤖 Live Demo
          </Button>
          <Button color="inherit" component={Link} to="/assessment">
            Assessment
          </Button>
          <Button color="inherit" component={Link} to="/dashboard">
            Dashboard
          </Button>
                Dashboard
              </Button>
            </>
          )}
          {currentUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color="inherit"
                onClick={handleMenu}
                startIcon={
                  userProfile?.photoURL ? (
                    <Avatar src={userProfile.photoURL} sx={{ width: 24, height: 24 }} />
                  ) : (
                    <AccountCircle />
                  )
                }
              >
                {userProfile?.displayName || 'User'}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {userProfile?.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/dashboard" onClick={handleClose}>
                  Dashboard
                </MenuItem>
                <MenuItem component={Link} to="/assessment" onClick={handleClose}>
                  Take Assessment
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;