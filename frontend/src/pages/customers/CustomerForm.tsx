"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import customerService from "../../services/customerService";
import type { Customer } from "../../types/Customer";

const CustomerForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const isEditMode = useMemo(() => id && id !== "new", [id]);

  const [customer, setCustomer] = useState<Customer>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCustomer = useCallback(async () => {
    if (!isEditMode) return;

    setLoading(true);
    try {
      const data = await customerService.getCustomerById(Number(id));
      setCustomer(data);
    } catch (err) {
      console.error("Error fetching customer:", err);
      setError("Failed to load customer details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customer.firstName.trim()) errors.firstName = "First name is required";
    if (!customer.lastName.trim()) errors.lastName = "Last name is required";
    if (!customer.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
      errors.email = "Email is invalid";
    }
    if (!customer.address.trim()) errors.address = "Address is required";
    if (!customer.phone.trim()) errors.phone = "Phone number is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setSaving(true);
      setError("");

      try {
        if (isEditMode) {
          await customerService.updateCustomer(Number(id), customer);
        } else {
          await customerService.createCustomer(customer);
        }
        navigate("/customers");
      } catch (err) {
        console.error("Error saving customer:", err);
        setError("Failed to save customer. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [customer, id, isEditMode, navigate]
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/customers")} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? "Edit Customer" : "Add Customer"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} aria-live="polite">
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {[
              { label: "First Name", name: "firstName" },
              { label: "Last Name", name: "lastName" },
              { label: "Email", name: "email", type: "email" },
              { label: "Address", name: "address" },
              { label: "Phone", name: "phone" },
            ].map(({ label, name, type = "text" }) => (
              <Grid key={name} item xs={12} sm={name === "email" ? 12 : 6}>
                <TextField
                  fullWidth
                  label={label}
                  name={name}
                  type={type}
                  value={customer[name as keyof Customer]}
                  onChange={handleChange}
                  error={!!formErrors[name]}
                  helperText={formErrors[name]}
                  required
                />
              </Grid>
            ))}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/customers")}>
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
  );
};

export default CustomerForm;
