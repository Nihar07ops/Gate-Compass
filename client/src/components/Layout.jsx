import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  TrendingUp,
  Psychology,
  Quiz,
  Analytics,
  MenuBook,
  Brightness4,
  Brightness7,
  Logout,
  School,
} from '@mui/icons-material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  { 
    text: 'Historical Trends', 
    icon: <TrendingUp />, 
    path: '/dashboard/trends',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  { 
    text: 'Enhanced Trends', 
    icon: <Analytics />, 
    path: '/dashboard/enhanced-trends',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  { 
    text: 'AI Predictions', 
    icon: <Psychology />, 
    path: '/dashboard/predictions',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  { 
    text: 'Mock Tests', 
    icon: <Quiz />, 
    path: '/dashboard/mock-test',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
  },
  { 
    text: 'Analytics', 
    icon: <Analytics />, 
    path: '/dashboard/analytics',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: '#fa709a'
  },
  { 
    text: 'Resources', 
    icon: <MenuBook />, 
    path: '/dashboard/resources',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    color: '#30cfd0'
  },
];

const Layout = ({ darkMode, toggleDarkMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: darkMode 
          ? 'linear-gradient(180deg, #1a1f3a 0%, #0a0e27 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(102, 126, 234, 0.1)',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(118, 75, 162, 0.1)',
          filter: 'blur(40px)',
        }}
      />

      {/* Logo Section */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <School sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              GateCompass
            </Typography>
          </Box>
          <Chip
            label="GATE CSE 2025"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Toolbar>

        <Divider sx={{ mx: 2, opacity: 0.1 }} />

        {/* Navigation Menu */}
        <List sx={{ px: 2, py: 2 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      position: 'relative',
                      overflow: 'hidden',
                      '&.Mui-selected': {
                        background: item.gradient,
                        color: 'white',
                        '&:hover': {
                          background: item.gradient,
                          filter: 'brightness(1.1)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      '&:hover': {
                        background: darkMode 
                          ? 'rgba(102, 126, 234, 0.1)' 
                          : 'rgba(102, 126, 234, 0.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isActive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          background: 'white',
                          borderRadius: '0 4px 4px 0',
                        }}
                      />
                    )}
                    <ListItemIcon
                      sx={{
                        color: isActive ? 'white' : item.color,
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.95rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Enhanced AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: darkMode
            ? 'rgba(26, 31, 58, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: darkMode
            ? '0 4px 30px rgba(0, 0, 0, 0.3)'
            : '0 4px 30px rgba(0, 0, 0, 0.05)',
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: darkMode ? 'white' : 'inherit',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            GATE CSE Preparation Platform
          </Typography>
          
          {/* Theme Toggle */}
          <IconButton 
            onClick={toggleDarkMode}
            sx={{
              mr: 1,
              background: darkMode 
                ? 'rgba(102, 126, 234, 0.1)' 
                : 'rgba(102, 126, 234, 0.05)',
              '&:hover': {
                background: darkMode 
                  ? 'rgba(102, 126, 234, 0.2)' 
                  : 'rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            {darkMode ? <Brightness7 sx={{ color: '#FFD700' }} /> : <Brightness4 />}
          </IconButton>

          {/* User Menu */}
          <IconButton onClick={handleMenuOpen}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
              }}
            >
              {user?.name?.[0]}
            </Avatar>
          </IconButton>
          <Menu 
            anchorEl={anchorEl} 
            open={Boolean(anchorEl)} 
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: '#f5576c',
                '&:hover': {
                  background: 'rgba(245, 87, 108, 0.1)',
                }
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: '#f5576c' }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: darkMode
              ? '4px 0 30px rgba(0, 0, 0, 0.3)'
              : '4px 0 30px rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content Area with Background */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mt: 8,
          minHeight: '100vh',
          background: darkMode
            ? 'linear-gradient(180deg, #0a0e27 0%, #1a1f3a 100%)'
            : 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)',
          position: 'relative',
        }}
      >
        {/* Subtle Background Pattern */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: drawerWidth,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.4) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
