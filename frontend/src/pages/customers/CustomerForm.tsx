"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
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
      console.error("Erreur lors de la récupération du client :", err);
      setError("Échec de la récupération des détails du client. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customer.firstName.trim()) errors.firstName = "Le prénom est requis";
    if (!customer.lastName.trim()) errors.lastName = "Le nom est requis";
    if (!customer.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
      errors.email = "L'email est invalide";
    }
    if (!customer.address.trim()) errors.address = "L'adresse est requise";
    if (!customer.phone.trim()) errors.phone = "Le numéro de téléphone est requis";

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
        console.error("Erreur lors de la sauvegarde du client :", err);
        setError("Échec de l'enregistrement du client. Veuillez réessayer.");
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
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/customers")}>
          Retour
        </Button>
        <Typography variant="h5" component="h1" sx={{ ml: 2 }}>
          {isEditMode ? "Modifier le client" : "Ajouter un client"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {[
              { label: "Prénom", name: "firstName" },
              { label: "Nom", name: "lastName" },
              { label: "Email", name: "email", type: "email" },
              { label: "Adresse", name: "address" },
              { label: "Numéro de téléphone", name: "phone" },
            ].map(({ label, name, type = "text" }) => (
              <Box key={name}>
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
                  sx={{ fontSize: "1rem", p: 1 }}
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate("/customers")} sx={{ mr: 2 }}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
              {saving ? <CircularProgress size={24} /> : "Sauvegarder"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomerForm;
