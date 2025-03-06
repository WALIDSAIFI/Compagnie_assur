"use client"

import type React from "react"
import { useState, useEffect, ChangeEvent } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material"
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import claimService from "../../services/claimService"
import policyService from "../../services/policyService"
import { type Claim, ClaimStatus } from "../../types/Claim"
import { type PolicyWithCustomer } from "../../types/Policy"
import { SelectChangeEvent } from '@mui/material/Select';

const ClaimForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const policyId = queryParams.get("policyId")

  const isEditMode = !!id && id !== "new"

  const [claim, setClaim] = useState<Claim>({
    date: new Date().toISOString().split("T")[0],
    description: "",
    claimedAmount: 0,
    status: ClaimStatus.PENDING,
    policyId: policyId ? Number.parseInt(policyId) : 0,
  })

  const [policies, setPolicies] = useState<PolicyWithCustomer[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchPolicies()
    if (isEditMode) {
      fetchClaim()
    }
  }, [isEditMode])

  const fetchPolicies = async () => {
    try {
      const data = await policyService.getAllPoliciesWithCustomers()
      setPolicies(data)
    } catch (err) {
      console.error("Error fetching policies:", err)
      setError("Failed to load policies. Please try again.")
    }
  }

  const fetchClaim = async () => {
    try {
      setLoading(true)
      const data = await claimService.getClaimById(Number(id))
      setClaim(data)
    } catch (err) {
      console.error("Error fetching claim:", err)
      setError("Failed to load claim details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!claim.date) {
      errors.date = "Date is required"
    }

    if (!claim.description.trim()) {
      errors.description = "Description is required"
    }

    if (!claim.claimedAmount || claim.claimedAmount <= 0) {
      errors.claimedAmount = "Claimed amount must be greater than 0"
    }

    if (!claim.policyId) {
      errors.policyId = "Policy is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      setClaim((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field when user changes it
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    const { name, value } = e.target;
    if (name) {
      setClaim((prev) => ({ ...prev, [name]: value }));
      
      // Clear error for this field when user changes it
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setClaim((prev) => ({
        ...prev,
        date: date.toISOString().split("T")[0],
      }))

      // Clear error for this field when user changes it
      if (formErrors.date) {
        setFormErrors((prev) => ({ ...prev, date: "" }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setError("")

      if (isEditMode) {
        await claimService.updateClaim(Number(id), claim)
      } else {
        await claimService.createClaim(claim)
      }

      // Navigate back to policy details or claims list
      if (claim.policyId) {
        navigate(`/policies/${claim.policyId}`)
      } else {
        navigate("/claims")
      }
    } catch (err) {
      console.error("Error saving claim:", err)
      setError("Failed to save claim. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => claim.policyId ? navigate(`/policies/${claim.policyId}`) : navigate("/claims")} 
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {isEditMode ? "Edit Claim" : "Submit New Claim"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.policyId}>
                  <InputLabel id="policy-label">Policy</InputLabel>
                  <Select
                    labelId="policy-label"
                    id="policyId"
                    name="policyId"
                    value={claim.policyId || ""}
                    label="Policy"
                    onChange={handleSelectChange}
                    disabled={!!policyId}
                  >
                    {policies.map((policy) => (
                      <MenuItem key={policy.policy.id} value={policy.policy.id}>
                        {policy.policy.id} - {policy.policy.type} - {policy.customer.firstName} {policy.customer.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.policyId && <FormHelperText>{formErrors.policyId}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date of Incident"
                  value={claim.date ? new Date(claim.date) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.date,
                      helperText: formErrors.date,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Claimed Amount ($)"
                  name="claimedAmount"
                  type="number"
                  value={claim.claimedAmount}
                  onChange={handleInputChange}
                  error={!!formErrors.claimedAmount}
                  helperText={formErrors.claimedAmount}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={claim.description}
                  onChange={handleInputChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description || "Please provide detailed information about the incident"}
                />
              </Grid>
              {isEditMode && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={claim.status}
                      label="Status"
                      onChange={(e) => {
                        setClaim((prev) => ({ ...prev, status: e.target.value as ClaimStatus }));
                      }}
                    >
                      <MenuItem value={ClaimStatus.PENDING}>Pending</MenuItem>
                      <MenuItem value={ClaimStatus.APPROVED}>Approved</MenuItem>
                      <MenuItem value={ClaimStatus.REJECTED}>Rejected</MenuItem>
                      <MenuItem value={ClaimStatus.SETTLED}>Settled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {isEditMode && claim.status === ClaimStatus.SETTLED && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Settled Amount ($)"
                    name="settledAmount"
                    type="number"
                    value={claim.settledAmount || ""}
                    onChange={handleInputChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => claim.policyId ? navigate(`/policies/${claim.policyId}`) : navigate("/claims")}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
                  {saving ? <CircularProgress size={24} /> : "Save"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  )
}

export default ClaimForm