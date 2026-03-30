// import { Routes, Route, Navigate } from "react-router-dom";

// /* ---------- Public Pages ---------- */
// import Login from "./Components/pages/Login.jsx";
// import Signup from "./Components/pages/Signup.jsx";

// /* ---------- Protected Pages ---------- */
// import Dashboard from "./Components/Dashboard/Dashboard.jsx";
// import Customize from "./Components/Customize/Customize.jsx";
// import CustomizeFlex from "./Components/Customize/CustomizeFlex.jsx";
// import CustomizePoster from "./Components/Customize/CustomizePoster.jsx";
// import CustomizeVisitingCard from "./Components/Customize/CustomizeVisitingCard.jsx";
// import CustomizeIdCard from "./Components/Customize/CustomizeIdCard.jsx";
// import Cart from "./Components/Cart/Cart.jsx";
// import Orders from "./Components/Orders/Orders.jsx";

// /* ---------- Auth & Layout ---------- */
// import ProtectedRoute from "./Components/ProtectedRoute";
// import AppLayout from "./Components/layout/AppLayout";

// function App() {
//   return (
//     <Routes>
//       {/* ================= PUBLIC ROUTES ================= */}
//       <Route path="/login" element={<Login />} />
//       <Route path="/signup" element={<Signup />} />

//       {/* ================= PROTECTED ROUTES ================= */}

//       {/* Dashboard */}
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <Dashboard />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       {/* Customization Studio */}
//       <Route
//         path="/customize"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <Customize />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/customize/flex"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <CustomizeFlex />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/customize/poster"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <CustomizePoster />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/customize/visiting-card"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <CustomizeVisitingCard />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/customize/id-card"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <CustomizeIdCard />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       {/* Cart */}
//       <Route
//         path="/cart"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <Cart />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       {/* Orders */}
//       <Route
//         path="/orders"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <Orders />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       {/* ================= FALLBACK ================= */}
//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// }

// export default App;





import { Routes, Route, Navigate } from "react-router-dom";

/* ---------- Protected Pages ---------- */
import Dashboard from "./Components/Dashboard/Dashboard.jsx";
import Customize from "./Components/Customize/Customize.jsx";
import CustomizeFlex from "./Components/Customize/CustomizeFlex.jsx";
import CustomizePoster from "./Components/Customize/CustomizePoster.jsx";
import CustomizeVisitingCard from "./Components/Customize/CustomizeVisitingCard.jsx";
import CustomizeIdCard from "./Components/Customize/CustomizeIdCard.jsx";
import Cart from "./Components/Cart/Cart.jsx";
import Orders from "./Components/Orders/Orders.jsx";

/* ---------- Layout ---------- */
import AppLayout from "./Components/layout/AppLayout";

function App() {
  return (
    <Routes>
      {/* ================= DASHBOARD (DEFAULT) ================= */}
      <Route
        path="/"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />

      {/* Customization Studio */}
      <Route
        path="/customize"
        element={
          <AppLayout>
            <Customize />
          </AppLayout>
        }
      />
      <Route
        path="/customize/flex"
        element={
          <AppLayout>
            <CustomizeFlex />
          </AppLayout>
        }
      />
      <Route
        path="/customize/poster"
        element={
          <AppLayout>
            <CustomizePoster />
          </AppLayout>
        }
      />
      <Route
        path="/customize/visiting-card"
        element={
          <AppLayout>
            <CustomizeVisitingCard />
          </AppLayout>
        }
      />
      <Route
        path="/customize/id-card"
        element={
          <AppLayout>
            <CustomizeIdCard />
          </AppLayout>
        }
      />

      {/* Cart */}
      <Route
        path="/cart"
        element={
          <AppLayout>
            <Cart />
          </AppLayout>
        }
      />

      {/* Orders */}
      <Route
        path="/orders"
        element={
          <AppLayout>
            <Orders />
          </AppLayout>
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
