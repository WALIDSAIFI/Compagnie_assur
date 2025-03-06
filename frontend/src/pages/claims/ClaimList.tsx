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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material"
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
} from "@mui/icons-material"
import claimService from "../../services/claimService"
import policyService from "../../services/policyService"
import { type Claim, ClaimStatus } from "../../types/Claim"
import { type PolicyWithCustomer } from "../../types/Policy"
import { SelectChangeEvent } from "@mui/material/Select"

const getStatusColor = (status: ClaimStatus) => {
  switch (status) {
    case ClaimStatus.APPROVED:
      return "success";
    case ClaimStatus.REJECTED:
      return "error";
    case ClaimStatus.SETTLED:
      return "info";
    default:
      return "warning";
  }
};

interface ClaimWithPolicy extends Claim {
  policyType?: string;
  customerName?: string;
}

const ClaimList: React.FC = () => {
  const [claims, setClaims] = useState<ClaimWithPolicy[]>([])
  const [filteredClaims, setFilteredClaims] = useState<ClaimWithPolicy[]>([])
  const [policies, setPolicies] = useState<PolicyWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [claimToDelete, setClaimToDelete] = useState<Claim | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterClaims()
  }, [searchTerm, statusFilter, claims])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [claimsData, policiesData] = await Promise.all([
        claimService.getAllClaims(),
        policyService.getAllPoliciesWithCustomers()
      ])
      
      setPolicies(policiesData)
      
      // Enrich claims with policy and customer data
      const enrichedClaims = claimsData.map(claim => {
        const relatedPolicy = policiesData.find(p => p.policy.id === claim.policyId)
        return {
          ...claim,
          policyType: relatedPolicy?.policy.type,
          customerName: relatedPolicy ? `${relatedPolicy.customer.firstName} ${relatedPolicy.customer.lastName}` : undefined
        }
      })
      
      setClaims(enrichedClaims)
      setFilteredClaims(enrichedClaims)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load claims data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const filterClaims = () => {
    let filtered = [...claims]
    
    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(claim => claim.status === statusFilter)
    }
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(claim => 
        claim.id?.toString().includes(term) ||
        claim.description.toLowerCase().includes(term) ||
        (claim.customerName && claim.customerName.toLowerCase().includes(term)) ||
        (claim.policyType && claim.policyType.toLowerCase().includes(term))
      )
    }
    
    setFilteredClaims(filtered)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }
  
  const handleClearSearch = () => {
    setSearchTerm("")
  }
  
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value)
  }
  
  const handleDeleteClick = (claim: Claim) => {
    setClaimToDelete(claim)
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!claimToDelete || !claimToDelete.id) return
    
    try {
      await claimService.deleteClaim(claimToDelete.id)
      setClaims(prevClaims => prevClaims.filter(c => c.id !== claimToDelete.id))
      setDeleteDialogOpen(false)
      setClaimToDelete(null)
    } catch (err) {
      console.error("Error deleting claim:", err)
      setError("Failed to delete claim. Please try again.")
    }
  }
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setClaimToDelete(null)
  }
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount)
  }
  
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Claims Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/claims/new")}
        >
          New Claim
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: "flex", mb: 3, gap: 2 }}>
        <TextField
          label="Search Claims"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value={ClaimStatus.PENDING}>Pending</MenuItem>
            <MenuItem value={ClaimStatus.APPROVED}>Approved</MenuItem>
            <MenuItem value={ClaimStatus.REJECTED}>Rejected</MenuItem>
            <MenuItem value={ClaimStatus.SETTLED}>Settled</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date Filed</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Policy Type</TableCell>
              <TableCell>Claim Amount</TableCell>
              <TableCell>Settled Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No claims found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.id}</TableCell>
                  <TableCell>{formatDate(claim.date)}</TableCell>
                  <TableCell>{claim.customerName || "Unknown"}</TableCell>
                  <TableCell>{claim.policyType || "Unknown"}</TableCell>
                  <TableCell>{formatCurrency(claim.claimedAmount)}</TableCell>
                  <TableCell>{claim.settledAmount ? formatCurrency(claim.settledAmount) : "-"}</TableCell>
                  <TableCell>
                    <Chip 
                      label={claim.status} 
                      color={getStatusColor(claim.status)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View">
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/claims/view/${claim.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/claims/edit/${claim.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(claim)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete claim #{claimToDelete?.id}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ClaimList