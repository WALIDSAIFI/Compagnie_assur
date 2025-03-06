import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Add as AddIcon, Person as PersonIcon } from '@mui/icons-material';
import policyService from '../../services/policyService';
import claimService from '../../services/claimService';
import { PolicyWithCustomer } from '../../types/Policy';
import { Claim, ClaimStatus } from '../../types/Claim';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`policy-tabpanel-${index}`}
      aria-labelledby={`policy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

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

const PolicyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState<PolicyWithCustomer | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPolicyData();
    }
  }, [id]);

  const fetchPolicyData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const policyData = await policyService.getPolicyWithCustomer(Number(id));
      setPolicy(policyData);
      
      const claimsData = await claimService.getClaimsByPolicyId(Number(id));
      setClaims(claimsData);
    } catch (err) {
      console.error('Error fetching policy data:', err);
      setError('Failed to load policy details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!policy && !loading) {
    return (
      <Alert severity="error">
        Policy not found. <Link to="/policies">Return to policy list</Link>
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/policies')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Policy Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/policies/edit/${id}`)}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="policy tabs">
            <Tab label="Policy Information" />
            <Tab label="Claims" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Policy Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Policy ID
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {policy?.policy.id}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Type
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Chip 
                        label={policy?.policy.type} 
                        color={
                          policy?.policy.type === 'AUTO' ? 'primary' : 
                          policy?.policy.type === 'HOME' ? 'secondary' : 
                          'success'
                        } 
                        size="small" 
                      />
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Coverage Amount
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        ${policy?.policy.coverageAmount}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Start Date
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {policy?.policy.startDate && new Date(policy.policy.startDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        End Date
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {policy?.policy.endDate && new Date(policy.policy.endDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      Customer Information
                    </Typography>
                    <IconButton 
                      color="primary" 
                      component={Link} 
                      to={`/customers/${policy?.customer.id}`}
                    >
                      <PersonIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {policy?.customer.firstName} {policy?.customer.lastName}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {policy?.customer.email}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Phone
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {policy?.customer.phone}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {policy?.customer.address}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Claims
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={Link}
              to={`/claims/new?policyId=${id}`}
            >
              Add Claim
            </Button>
          </Box>
          
          {claims.length > 0 ? (
            <List>
              {claims.map((claim) => (
                <Paper key={claim.id} sx={{ mb: 2 }}>
                  <ListItem
                    component={Link}
                    to={`/claims/view/${claim.id}`}
                    sx={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemText
                      primary={`Claim #${claim.id}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Date: {new Date(claim.date).toLocaleDateString()}
                          </Typography>
                          <br />
                          {claim.description.substring(0, 100)}
                          {claim.description.length > 100 ? '...' : ''}
                          <br />
                          Claimed Amount: ${claim.claimedAmount}
                          {claim.settledAmount ? ` | Settled Amount: $${claim.settledAmount}` : ''}
                        </>
                      }
                    />
                    <Chip 
                      label={claim.status} 
                      color={getStatusColor(claim.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"} 
                      size="small" 
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No claims found for this policy.
            </Typography>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PolicyDetail;
