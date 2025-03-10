"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Container, Box, Typography, TextField, Button, Paper, Avatar, Alert, CircularProgress } from "@mui/material"
import { LockOutlined } from "@mui/icons-material"
import { useAuth } from "../contexts/AuthContext"

const Login: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError("Please enter both username and password")
      return
    }

    try {
      setError("")
      setLoading(true)
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to login. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ backgroundColor: "#e8f5e9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Paper
      elevation={6}
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: 4,
        border: "2px solid #d32f2f",
        backgroundColor: "white",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "#2e7d32" }}>
        <LockOutlined />
      </Avatar>
      <Typography component="h1" variant="h5" color="secondary">
        Sign In
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: "100%" }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              "& fieldset": { borderColor: "#2e7d32" },
              "&:hover fieldset": { borderColor: "#1b5e20" },
              "&.Mui-focused fieldset": { borderColor: "#1b5e20" },
            },
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              "& fieldset": { borderColor: "#d32f2f" },
              "&:hover fieldset": { borderColor: "#b71c1c" },
              "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
            },
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, backgroundColor: "#2e7d32", borderRadius: 2, "&:hover": { backgroundColor: "#1b5e20" } }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign In"}
        </Button>
        <Box sx={{ textAlign: "center" }}>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <Typography variant="body2" color="secondary">
              Don't have an account? Sign Up
            </Typography>
          </Link>
        </Box>
      </Box>
    </Paper>
  </Container>
  )
}

export default Login

