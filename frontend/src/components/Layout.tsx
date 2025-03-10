"use client"

import type React from "react"
import { useState } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  styled,
  useTheme,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Description,
  ReportProblem,
  Logout,
  AccountCircle,
  Settings,
} from "@mui/icons-material"
import { useAuth } from "../contexts/AuthContext"

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#1A1A1A' : '#0F3D5F',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

const Sidebar = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: 240,
    background: 'linear-gradient(180deg, #0F3D5F 0%, #1A567E 100%)',
    color: 'white',
  },
})

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleCloseUserMenu = () => setAnchorElUser(null)

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Clients', icon: <People />, path: '/customers' },
    { text: 'Polices', icon: <Description />, path: '/policies' },
    { text: 'Réclamations', icon: <ReportProblem />, path: '/claims' },
  ]

  const drawerContent = (
    <Box>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="inherit">
          AssurPlus
        </Typography>
        <Typography variant="subtitle2" sx={{ color: '#B0BEC5' }}>
          Gestion d'assurances
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                background: 'rgba(255,255,255,0.15)',
                borderLeft: `4px solid ${theme.palette.secondary.main}`,
              },
              '&:hover': {
                background: 'rgba(255,255,255,0.08)',
              },
              py: 1.5,
              pl: 3,
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': { opacity: 0.9 },
            }}
          >
            AssurPlus
          </Typography>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Paramètres du compte">
                <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                  <Avatar
                    alt={user?.username}
                    src="/static/images/avatar/2.jpg"
                    sx={{ width: 36, height: 36 }}
                  />
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    boxShadow: theme.shadows[3],
                  }
                }}>
                <MenuItem onClick={handleCloseUserMenu} component={Link} to="/profile">
                  <ListItemIcon><AccountCircle /></ListItemIcon>
                  Mon profil
                </MenuItem>
                <MenuItem onClick={handleCloseUserMenu} component={Link} to="/settings">
                  <ListItemIcon><Settings /></ListItemIcon>
                  Paramètres
                </MenuItem>
                <Divider />
                <MenuItem onClick={logout}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  Déconnexion
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              <Button
                component={Link}
                to="/login"
                color="inherit"
                sx={{ textTransform: 'none', px: 2 }}
              >
                Connexion
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                color="inherit"
                sx={{ ml: 2, textTransform: 'none' }}
              >
                Créer un compte
              </Button>
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>

      <Box component="nav">
        <Sidebar
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {drawerContent}
        </Sidebar>
        
        <Sidebar
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawerContent}
        </Sidebar>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: { md: `240px` },
          width: { md: `calc(100% - 240px)` },
        }}
      >
        <Toolbar /> {/* Espace pour l'AppBar */}
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}

export default Layout