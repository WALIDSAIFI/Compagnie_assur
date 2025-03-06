"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material"
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Description as DescriptionIcon } from "@mui/icons-material"
import customerService from "../../services/customerService"
import policyService from "../../services/policyService"
import type { Customer } from "../../types/Customer"
import type { Policy } from "../../types/Policy"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    if (id) {
      fetchCustomerData()
    }
  }, [id])

  const fetchCustomerData = async () => {
    try {
      setLoading(true)
      setError("")

      const customerData = await customerService.getCustomerById(Number(id))
      setCustomer(customerData)

      const policiesData = await policyService.getPoliciesByCustomerId(Number(id))
      setPolicies(policiesData)
    } catch (err) {
      console.error("Error fetching customer data:", err)
      setError("Failed to load customer details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!customer && !loading) {
    return (
      <Alert severity="error">
        Customer not found. <Link to="/customers">Return to customer list</Link>
      </Alert>
    )
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/customers")} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Customer Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/customers/edit/${id}`)}>
          Edit
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer tabs">
            <Tab label="Profile" />
            <Tab label="Policies" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        First Name
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{customer?.firstName}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Name
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{customer?.lastName}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{customer?.email}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Phone
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{customer?.phone}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{customer?.address}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Policies</Typography>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              component={Link}
              to={`/policies/new?customerId=${id}`}
            >
              Add Policy
            </Button>
          </Box>

          {policies.length > 0 ? (
            <List>
              {policies.map((policy) => (
                <Paper key={policy.id} sx={{ mb: 2 }}>
                  <ListItem
                    component={Link}
                    to={`/policies/${policy.id}`}
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={`Policy #${policy.id}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Type: {policy.type}
                          </Typography>
                          <br />
                          Coverage: ${policy.coverageAmount}
                          <br />
                          Valid: {new Date(policy.startDate).toLocaleDateString()} -{" "}
                          {new Date(policy.endDate).toLocaleDateString()}
                        </>
                      }
                    />
                    <Chip
                      label={policy.type}
                      color={policy.type === "AUTO" ? "primary" : policy.type === "HOME" ? "secondary" : "success"}
                      size="small"
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No policies found for this customer.
            </Typography>
          )}
        </TabPanel>
      </Paper>
    </Box>
  )
}

export default CustomerDetail

