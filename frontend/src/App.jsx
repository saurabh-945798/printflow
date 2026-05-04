import { Navigate, Route, Routes } from "react-router-dom";

import Cart from "./Components/Cart/Cart.jsx";
import Customize from "./Components/Customize/Customize.jsx";
import CustomizeFlex from "./Components/Customize/CustomizeFlex.jsx";
import CustomizeIdCard from "./Components/Customize/CustomizeIdCard.jsx";
import CustomizePoster from "./Components/Customize/CustomizePoster.jsx";
import CustomizeVisitingCard from "./Components/Customize/CustomizeVisitingCard.jsx";
import Dashboard from "./Components/Dashboard/Dashboard.jsx";
import AppLayout from "./Components/layout/AppLayout.jsx";
import Orders from "./Components/Orders/Orders.jsx";
import Login from "./Components/pages/Login.jsx";
import Signup from "./Components/pages/Signup.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
const { user, loading } = useAuth();

if (loading) {
return ( <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-700">
Please wait, loading your PrintFlow experience... </div>
);
}

return ( <Routes>
<Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
<Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

```
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </ProtectedRoute>
    }
  />
  <Route
    path="/customize"
    element={
      <ProtectedRoute>
        <AppLayout>
          <Customize />
        </AppLayout>
      </ProtectedRoute>
    }
  />
  <Route
    path="/customize/cloth"
    element={
      <ProtectedRoute>
        <AppLayout>
          <CustomizeFlex />
        </AppLayout>
      </ProtectedRoute>
    }
  />
  <Route
    path="/customize/cup"
    element={
      <ProtectedRoute>
        <AppLayout>
          <CustomizePoster />
        </AppLayout>
      </ProtectedRoute>
    }
  />
  <Route
    path="/customize/visiting-card"
    element={
      <ProtectedRoute>
        <AppLayout>
          <CustomizeVisitingCard />
        </AppLayout>
      </ProtectedRoute>
    }
  />
  <Route
    path="/customize/id-card"
    element={
      <ProtectedRoute>
        <AppLayout>
          <CustomizeIdCard />
        </AppLayout>
      </ProtectedRoute>
    }
  />
  <Route
    path="/cart"
    element={
      <ProtectedRoute>
        <AppLayout>
          <Cart />
        </AppLayout>
      </ProtectedRoute>
    }
  />
  <Route
    path="/orders"
    element={
      <ProtectedRoute>
        <AppLayout>
          <Orders />
        </AppLayout>
      </ProtectedRoute>
    }
  />

  <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
  <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
</Routes>


);
}

export default App;
