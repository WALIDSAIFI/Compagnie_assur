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
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import claimService from '../../services/claimService';
import policyService from '../../services/policyService';
import { Claim, ClaimStatus } from '../../types/Claim';
import { PolicyWithCustomer } from '../../types/Policy';

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

const ClaimDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [policy, setPolicy] = useState<PolicyWithCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialogs state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settledAmount, setSettledAmount] = useState<number>(0);

  useEffect(() => {
    if (id) {
      fetchClaimData();
    }
  }, [id]);

  const fetchClaimData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const claimData = await claimService.getClaimById(Number(id));
      setClaim(claimData);
      
      if (claimData.policyId) {
        const policyData = await policyService.getPolicyWithCustomer(claimData.policyId);
        setPolicy(policyData);
      }
    } catch (err) {
      console.error('Error fetching claim data:', err);
      setError('Failed to load claim details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!claim?.id) return;
    
    try {
      await claimService.updateClaimStatus(claim.id, ClaimStatus.APPROVED);
      setApproveDialogOpen(false);
      fetchClaimData();
    } catch (err) {
      console.error('Error approving claim:', err);
      setError('Failed to approve claim. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!claim?.id) return;
    
    try {
      await claimService.updateClaimStatus(claim.id, ClaimStatus.REJECTED);
      setRejectDialogOpen(false);
      fetchClaimData();
    } catch (err) {
      console.error('Error rejecting claim:', err);
      setError('Failed to reject claim. Please try again.');
    }
  };

  const handleSettle = async () => {
    if (!claim?.id) return;
    
    try {
      await claimService.updateClaimStatus(claim.id, ClaimStatus.SETTLED, settledAmount);
      setSettleDialogOpen(false);
      fetchClaimData();
    } catch (err) {
      console.error('Error settling claim:', err);
      setError('Failed to settle claim. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!claim?.id) return;
    
    try {
      await claimService.deleteClaim(claim.id);
      setDeleteDialogOpen(false);
      navigate(`/policies/${claim.policyId}`);
    } catch (err) {
      console.error('Error deleting claim:', err);
      setError('Failed to delete claim. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!claim && !loading) {
    return (
      <Alert severity="error">
        Claim not found. <Link to="/claims">Return to claims list</Link>
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/policies/${claim?.policyId}`)}
          sx={{ mr: 2 }}
        >
          Back to Policy
        </Button>
        <Typography variant="h4" component="h1">
          Claim Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/claims/edit/${id}`)}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ mr: 1 }}
        >
          Delete
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Claim Information
                </Typography>
                <Chip 
                  label={claim?.status} 
                  color={getStatusColor(claim?.status as ClaimStatus)} 
                  size="medium" 
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Claim ID
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {claim?.id}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date Filed
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {claim?.date && new Date(claim.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Claimed Amount
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    ${claim?.claimedAmount}
                  </Typography>
                </Grid>
                
                {claim?.settledAmount && (
                  <>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Settled Amount
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        ${claim.settledAmount}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body1">
                      {claim?.description}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Related Policy
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
                    <Link to={`/policies/${policy?.policy.id}`}>
                      {policy?.policy.id}
                    </Link>
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
                    Customer
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    <Link to={`/customers/${policy?.customer.id}`}>
                      {policy?.customer.firstName} {policy?.customer.lastName}
                    </Link>
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Coverage
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    ${policy?.policy.coverageAmount}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {claim?.status === ClaimStatus.PENDING && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<CheckIcon />}
                    onClick={() => setApproveDialogOpen(true)}
                    fullWidth
                  >
                    Approve Claim
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<CloseIcon />}
                    onClick={() => setRejectDialogOpen(true)}
                    fullWidth
                  >
                    Reject Claim
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
          
          {claim?.status === ClaimStatus.APPROVED && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Button 
                  variant="contained" 
                  color="info" 
                  startIcon={<AttachMoneyIcon />}
                  onClick={() => {
                    setSettledAmount(claim.claimedAmount);
                    setSettleDialogOpen(true);
                  }}
                  fullWidth
                >
                  Settle Claim
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
      >
        <DialogTitle>Approve Claim</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this claim for ${claim?.claimedAmount}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApprove} color="success" autoFocus>
            Approve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>Reject Claim</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this claim?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error" autoFocus>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Settle Dialog */}
      <Dialog
        open={settleDialogOpen}
        onClose={() => setSettleDialogOpen(false)}
      >
        <DialogTitle>Settle Claim</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the final settlement amount for this claim.
          </DialogContentText>
          <Grid container spacing={2} alignItems="center">
            <Grid item>$</Grid>
            <Grid item xs>
              <input
                type="number"
                value={settledAmount}
                onChange={(e) => setSettledAmount(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                min="0"
                max={claim?.claimedAmount}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSettle} 
            color="info" 
            autoFocus
            disabled={settledAmount <= 0 || (claim?.claimedAmount ? settledAmount > claim.claimedAmount : false)}
          >
            Settle
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Claim</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this claim? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimDetail;