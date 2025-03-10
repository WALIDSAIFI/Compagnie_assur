import type React from "react"
import { useState, useEffect } from "react"
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
} from "@mui/material"
import { People as PeopleIcon, Description as DescriptionIcon, ReportProblem as ReportIcon } from "@mui/icons-material"
import { useAuth } from "../contexts/AuthContext"
import customerService from "../services/customerService"
import policyService from "../services/policyService"
import claimService from "../services/claimService"
import type { Customer } from "../types/Customer"
import type { Policy } from "../types/Policy"
import type { Claim } from "../types/Claim"

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [customerCount, setCustomerCount] = useState(0)
  const [policyCount, setPolicyCount] = useState(0)
  const [claimCount, setClaimCount] = useState(0)
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [recentPolicies, setRecentPolicies] = useState<Policy[]>([])
  const [recentClaims, setRecentClaims] = useState<Claim[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch customers
        const customers = await customerService.getAllCustomers()
        setCustomerCount(customers.length)
        setRecentCustomers(customers.slice(0, 5))

        // Fetch policies
        const policies = await policyService.getAllPolicies()
        setPolicyCount(policies.length)
        setRecentPolicies(policies.slice(0, 5))

        // Fetch claims
        const claims = await claimService.getAllClaims()
        setClaimCount(claims.length)
        setRecentClaims(claims.slice(0, 5))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ mb: 4 }}>
        Welcome, {user?.username}!
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards with New Color Palette */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ display: "flex", flexDirection: "column", height: 180 }}>
            <CardHeader
              avatar={<PeopleIcon sx={{ fontSize: 40, color: "white" }} />}
              title="Total Customers"
              sx={{
                backgroundColor: "#4CAF50", // Green
                color: "white",
              }}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {customerCount}
              </Typography>
              <Chip label="Active" color="success" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ display: "flex", flexDirection: "column", height: 180 }}>
            <CardHeader
              avatar={<DescriptionIcon sx={{ fontSize: 40, color: "white" }} />}
              title="Active Policies"
              sx={{
                backgroundColor: "#2196F3", // Blue
                color: "white",
              }}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {policyCount}
              </Typography>
              <Chip label="Pending Review" color="warning" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ display: "flex", flexDirection: "column", height: 180 }}>
            <CardHeader
              avatar={<ReportIcon sx={{ fontSize: 40, color: "white" }} />}
              title="Open Claims"
              sx={{
                backgroundColor: "#FF5722", // Deep Orange
                color: "white",
              }}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {claimCount}
              </Typography>
              <Chip label="Urgent" color="error" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Items List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Recent Customers" avatar={<PeopleIcon color="primary" />} />
            <Divider />
            <CardContent>
              {recentCustomers.length > 0 ? (
                <List>
                  {recentCustomers.map((customer) => (
                    <ListItem key={customer.id}>
                      <ListItemText primary={`${customer.firstName} ${customer.lastName}`} secondary={customer.email} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No customers found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Recent Policies" avatar={<DescriptionIcon color="secondary" />} />
            <Divider />
            <CardContent>
              {recentPolicies.length > 0 ? (
                <List>
                  {recentPolicies.map((policy) => (
                    <ListItem key={policy.id}>
                      <ListItemText
                        primary={`Policy #${policy.id}`}
                        secondary={`Type: ${policy.type} | Coverage: $${policy.coverageAmount}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No policies found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Recent Claims" avatar={<ReportIcon color="error" />} />
            <Divider />
            <CardContent>
              {recentClaims.length > 0 ? (
                <List>
                  {recentClaims.map((claim) => (
                    <ListItem key={claim.id}>
                      <ListItemText
                        primary={`Claim #${claim.id}`}
                        secondary={`Status: ${claim.status} | Amount: $${claim.claimedAmount}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No claims found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
