import type React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/customers/CustomerList";
import CustomerForm from "./pages/customers/CustomerForm";
import CustomerDetail from "./pages/customers/CustomerDetail";
import PolicyList from "./pages/policies/PolicyList";
import PolicyForm from "./pages/policies/PolicyForm";
import PolicyDetail from "./pages/policies/PolicyDetail";
import ClaimList from "./pages/claims/ClaimList";
import ClaimForm from "./pages/claims/ClaimForm";
import ClaimDetail from "./pages/claims/ClaimDetail";
import NotFound from "./pages/NotFound";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomerList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/new"
          element={
            <ProtectedRoute>
              <CustomerForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/edit/:id"
          element={
            <ProtectedRoute>
              <CustomerForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <CustomerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/policies"
          element={
            <ProtectedRoute>
              <PolicyList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/policies/new"
          element={
            <ProtectedRoute>
              <PolicyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/policies/edit/:id"
          element={
            <ProtectedRoute>
              <PolicyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/policies/:id"
          element={
            <ProtectedRoute>
              <PolicyDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims"
          element={
            <ProtectedRoute>
              <ClaimList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/new"
          element={
            <ProtectedRoute>
              <ClaimForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/edit/:id"
          element={
            <ProtectedRoute>
              <ClaimForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/view/:id"
          element={
            <ProtectedRoute>
              <ClaimDetail />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;