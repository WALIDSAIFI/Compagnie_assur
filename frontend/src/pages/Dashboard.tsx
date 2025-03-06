"use client"

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
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
              bgcolor: "primary.light",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Total Customers
              </Typography>
            </Box>
            <Typography variant="h3" component="div">
              {customerCount}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
              bgcolor: "secondary.light",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <DescriptionIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Active Policies
              </Typography>
            </Box>
            <Typography variant="h3" component="div">
              {policyCount}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
              bgcolor: "error.light",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ReportIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Open Claims
              </Typography>
            </Box>
            <Typography variant="h3" component="div">
              {claimCount}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Customers */}
        <Grid item xs={12} md={4}>
          <Card>
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

        {/* Recent Policies */}
        <Grid item xs={12} md={4}>
          <Card>
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

        {/* Recent Claims */}
        <Grid item xs={12} md={4}>
          <Card>
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

