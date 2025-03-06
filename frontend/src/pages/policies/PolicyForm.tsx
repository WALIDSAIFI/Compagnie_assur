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
import policyService from "../../services/policyService"
import customerService from "../../services/customerService"
import { type Policy, PolicyType } from "../../types/Policy"
import type { Customer } from "../../types/Customer"
import { SelectChangeEvent } from '@mui/material/Select';


const PolicyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const customerId = queryParams.get("customerId")

  const isEditMode = !!id && id !== "new"

  const [policy, setPolicy] = useState<Policy>({
    type: PolicyType.AUTO,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    coverageAmount: 0,
    customerId: customerId ? Number.parseInt(customerId) : 0,
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCustomers()
    if (isEditMode) {
      fetchPolicy()
    }
  }, [isEditMode])

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers()
      setCustomers(data)
    } catch (err) {
      console.error("Error fetching customers:", err)
      setError("Failed to load customers. Please try again.")
    }
  }

  const fetchPolicy = async () => {
    try {
      setLoading(true)
      const data = await policyService.getPolicyById(Number(id))
      setPolicy(data)
    } catch (err) {
      console.error("Error fetching policy:", err)
      setError("Failed to load policy details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!policy.type) {
      errors.type = "Policy type is required"
    }

    if (!policy.startDate) {
      errors.startDate = "Start date is required"
    }

    if (!policy.endDate) {
      errors.endDate = "End date is required"
    } else if (new Date(policy.startDate) >= new Date(policy.endDate)) {
      errors.endDate = "End date must be after start date"
    }

    if (!policy.coverageAmount || policy.coverageAmount <= 0) {
      errors.coverageAmount = "Coverage amount must be greater than 0"
    }

    if (!policy.customerId) {
      errors.customerId = "Customer is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<PolicyType | number>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setPolicy((prev) => ({ ...prev, [name]: value }));
  
      // Clear error for this field when user changes it
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleDateChange = (field: "startDate" | "endDate", date: Date | null) => {
    if (date) {
      setPolicy((prev) => ({
        ...prev,
        [field]: date.toISOString().split("T")[0],
      }))

      // Clear error for this field when user changes it
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: "" }))
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
        await policyService.updatePolicy(Number(id), policy)
      } else {
        await policyService.createPolicy(policy)
      }

      navigate("/policies")
    } catch (err) {
      console.error("Error saving policy:", err)
      setError("Failed to save policy. Please try again.")
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
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/policies")} sx={{ mr: 2 }}>
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {isEditMode ? "Edit Policy" : "Add Policy"}
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
                <FormControl fullWidth error={!!formErrors.type}>
                  <InputLabel id="policy-type-label">Policy Type</InputLabel>
                  <Select
                    labelId="policy-type-label"
                    id="type"
                    name="type"
                    value={policy.type}
                    label="Policy Type"
                    onChange={handleChange}
                  >
                    <MenuItem value={PolicyType.AUTO}>Auto</MenuItem>
                    <MenuItem value={PolicyType.HOME}>Home</MenuItem>
                    <MenuItem value={PolicyType.HEALTH}>Health</MenuItem>
                  </Select>
                  {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.customerId}>
                  <InputLabel id="customer-label">Customer</InputLabel>
                  <Select
                    labelId="customer-label"
                    id="customerId"
                    name="customerId"
                    value={policy.customerId || ""}
                    label="Customer"
                    onChange={handleChange}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.customerId && <FormHelperText>{formErrors.customerId}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={policy.startDate ? new Date(policy.startDate) : null}
                  onChange={(date) => handleDateChange("startDate", date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.startDate,
                      helperText: formErrors.startDate,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={policy.endDate ? new Date(policy.endDate) : null}
                  onChange={(date) => handleDateChange("endDate", date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.endDate,
                      helperText: formErrors.endDate,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Coverage Amount ($)"
                  name="coverageAmount"
                  type="number"
                  value={policy.coverageAmount}
                  onChange={handleChange}
                  error={!!formErrors.coverageAmount}
                  helperText={formErrors.coverageAmount}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate("/policies")}>
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

export default PolicyForm

