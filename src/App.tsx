import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Dashboard from "@/pages/Dashboard"
import ClienteList from "@/pages/clientes/ClienteList"
import ServicioList from "@/pages/servicios/ServicioList"
import ReciboList from "@/pages/recibos/ReciboList"
import ReciboForm from "@/pages/recibos/ReciboForm"
import ReciboDetail from "@/pages/recibos/ReciboDetail"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<ClienteList />} />
          <Route path="/servicios" element={<ServicioList />} />
          <Route path="/recibos" element={<ReciboList />} />
          <Route path="/recibos/crear" element={<ReciboForm />} />
          <Route path="/recibos/:id" element={<ReciboDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
