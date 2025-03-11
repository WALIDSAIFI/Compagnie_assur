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
      <Box sx={{ maxWidth: 900, margin: "0 auto", p: 2 }}>
        <Typography variant="h5" sx={{ textAlign: "center", marginBottom: 2 }}>
          {isEditMode ? "Modifier la réclamation" : "Soumettre une réclamation"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ padding: 2, boxShadow: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" error={!!formErrors.policyId}>
                  <InputLabel id="policy-label">Politique</InputLabel>
                  <Select
                    labelId="policy-label"
                    id="policyId"
                    name="policyId"
                    value={claim.policyId || ""}
                    label="Politique"
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

              <Grid item xs={12}>
                <DatePicker
                  label="Date de l'incident"
                  value={claim.date ? new Date(claim.date) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.date,
                      helperText: formErrors.date,
                      size: "small",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Montant réclamé (MAD)"
                  name="claimedAmount"
                  type="number"
                  value={claim.claimedAmount}
                  onChange={handleInputChange}
                  error={!!formErrors.claimedAmount}
                  helperText={formErrors.claimedAmount}
                  InputProps={{ inputProps: { min: 0 } }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={2}
                  value={claim.description}
                  onChange={handleInputChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description || "Décrivez l'incident avec le plus de détails possible."}
                  size="small"
                />
              </Grid>

              {isEditMode && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="status-label">Statut</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={claim.status}
                      label="Statut"
                      onChange={(e) => {
                        setClaim((prev) => ({ ...prev, status: e.target.value as ClaimStatus }));
                      }}
                    >
                      <MenuItem value={ClaimStatus.PENDING}>En attente</MenuItem>
                      <MenuItem value={ClaimStatus.APPROVED}>Approuvé</MenuItem>
                      <MenuItem value={ClaimStatus.REJECTED}>Rejeté</MenuItem>
                      <MenuItem value={ClaimStatus.SETTLED}>Réglé</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {isEditMode && claim.status === ClaimStatus.SETTLED && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Montant réglé (MAD)"
                    name="settledAmount"
                    type="number"
                    value={claim.settledAmount || ""}
                    onChange={handleInputChange}
                    InputProps={{ inputProps: { min: 0 } }}
                    size="small"
                  />
                </Grid>
              )}

              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => claim.policyId ? navigate(`/policies/${claim.policyId}`) : navigate("/claims")}
                  sx={{
                    backgroundColor: "#f5f5f5", 
                    color: "#333", 
                    "&:hover": {
                      backgroundColor: "#ddd"
                    },
                    padding: "6px 12px",
                    fontSize: "0.875rem"
                  }}
                >
                  Annuler
                </Button>

                <Button 
                  variant="contained" 
                  type="submit"
                  sx={{
                    backgroundColor: "#0073e6", 
                    color: "#fff", 
                    "&:hover": {
                      backgroundColor: "#005bb5"
                    },
                    padding: "6px 12px",
                    fontSize: "0.875rem"
                  }}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                >
                  {isEditMode ? "Mettre à jour" : "Soumettre"}
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
