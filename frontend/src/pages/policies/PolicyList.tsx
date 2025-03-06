"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Chip,
} from "@mui/material"
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
} from "@mui/icons-material"
import policyService from "../../services/policyService"
import type { PolicyWithCustomer } from "../../types/Policy"

const PolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyWithCustomer[]>([])
  const [filteredPolicies, setFilteredPolicies] = useState<PolicyWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<PolicyWithCustomer | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchPolicies()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = policies.filter(
        (policy) =>
          policy.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.policy.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPolicies(filtered)
    } else {
      setFilteredPolicies(policies)
    }
  }, [searchTerm, policies])

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await policyService.getAllPoliciesWithCustomers()
      setPolicies(data)
      setFilteredPolicies(data)
    } catch (err) {
      console.error("Error fetching policies:", err)
      setError("Failed to load policies. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const handleDeleteClick = (policy: PolicyWithCustomer) => {
    setPolicyToDelete(policy)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!policyToDelete?.policy.id) return

    try {
      await policyService.deletePolicy(policyToDelete.policy.id)
      setPolicies(policies.filter((p) => p.policy.id !== policyToDelete.policy.id))
      setDeleteDialogOpen(false)
      setPolicyToDelete(null)
    } catch (err) {
      console.error("Error deleting policy:", err)
      setError("Failed to delete policy. Please try again.")
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPolicyToDelete(null)
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Policies
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/policies/new">
          Add Policy
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search policies by customer name or type..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredPolicies.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Coverage Amount</TableCell>
                <TableCell>Valid Period</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPolicies.map((policyWithCustomer) => {
                const { policy, customer } = policyWithCustomer
                return (
                  <TableRow key={policy.id}>
                    <TableCell>{policy.id}</TableCell>
                    <TableCell>
                      <Chip
                        label={policy.type}
                        color={policy.type === "AUTO" ? "primary" : policy.type === "HOME" ? "secondary" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{`${customer.firstName} ${customer.lastName}`}</TableCell>
                    <TableCell>${policy.coverageAmount}</TableCell>
                    <TableCell>
                      {new Date(policy.startDate).toLocaleDateString()} -{" "}
                      {new Date(policy.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="View">
                          <IconButton color="primary" onClick={() => navigate(`/policies/${policy.id}`)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton color="secondary" onClick={() => navigate(`/policies/edit/${policy.id}`)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDeleteClick(policyWithCustomer)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">
            {searchTerm ? "No policies match your search criteria." : "No policies found."}
          </Typography>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {policyToDelete?.policy.type} policy for{" "}
            {policyToDelete?.customer.firstName} {policyToDelete?.customer.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PolicyList

