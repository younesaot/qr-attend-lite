import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ScanQR from "./pages/ScanQR";
import Students from "./pages/Students";
import StudentForm from "./pages/StudentForm";
import StudentCard from "./pages/StudentCard";
import AllStudentCards from "./pages/AllStudentCards";
import Attendance from "./pages/Attendance";
import Absence from "./pages/Absence";
import Database from "./pages/Database";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scan" element={<ScanQR />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/add" element={<StudentForm />} />
            <Route path="/students/edit/:id" element={<StudentForm />} />
            <Route path="/students/card/:id" element={<StudentCard />} />
            <Route path="/students/print-all" element={<AllStudentCards />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/absence" element={<Absence />} />
            <Route path="/database" element={<Database />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
