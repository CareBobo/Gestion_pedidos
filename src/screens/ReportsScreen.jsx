import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, FileText, Download, DollarSign, RefreshCw, ShoppingCart, Users, Store
} from 'lucide-react';

export default function ReportsScreen() {
  const { orders } = useApp();
  
  // Date filter state: 'diario' | 'semanal' | 'mensual'
  const [reportType, setReportType] = useState('diario');

  // Helper to filter orders by date range
  const getFilteredOrders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(o => {
      if (o.status === 'cancelado') return false;
      const orderDate = new Date(o.created_at);
      
      if (reportType === 'diario') {
        return orderDate >= today;
      } else if (reportType === 'semanal') {
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= oneWeekAgo;
      } else if (reportType === 'mensual') {
        const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return orderDate >= oneMonthAgo;
      }
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Metrics calculators (Expenditures / Purchases)
  const totalExpenditure = filteredOrders.reduce((sum, o) => sum + o.total_value, 0);
  const totalOrders = filteredOrders.length;
  const averageTicket = totalOrders > 0 ? totalExpenditure / totalOrders : 0;

  // Purchases breakdown by Company
  const getCompanyBreakdown = () => {
    const breakdown = {};
    filteredOrders.forEach(o => {
      if (!breakdown[o.company_name]) {
        breakdown[o.company_name] = { name: o.company_name, count: 0, revenue: 0 };
      }
      breakdown[o.company_name].count += 1;
      breakdown[o.company_name].revenue += o.total_value;
    });
    return Object.values(breakdown).sort((a, b) => b.revenue - a.revenue);
  };

  const companyBreakdown = getCompanyBreakdown();

  // Purchases breakdown by Seller
  const getSellerBreakdown = () => {
    const breakdown = {};
    filteredOrders.forEach(o => {
      if (!breakdown[o.seller_name]) {
        breakdown[o.seller_name] = { name: o.seller_name, company: o.company_name, count: 0, revenue: 0 };
      }
      breakdown[o.seller_name].count += 1;
      breakdown[o.seller_name].revenue += o.total_value;
    });
    return Object.values(breakdown).sort((a, b) => b.revenue - a.revenue);
  };

  const sellerBreakdown = getSellerBreakdown();

  // EXPORT TO PDF (HTML print reporter)
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const rangeText = reportType === 'diario' ? 'HOY' : reportType === 'semanal' ? 'ÚLTIMA SEMANA' : 'ÚLTIMO MES';
    const dateText = new Date().toLocaleString();
    
    let tableRows = '';
    filteredOrders.forEach(o => {
      tableRows += `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${o.order_number}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${o.company_name}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${o.seller_name} (${o.seller_phone})</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;font-size:11px;">${o.description}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${o.total_value.toFixed(2)}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Compras - ${rangeText}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 30px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0A192F; padding-bottom: 15px; margin-bottom: 20px; }
            .brand { font-size: 24px; font-weight: bold; color: #0A192F; }
            .report-title { font-size: 18px; margin-top: 5px; color: #D4AF37; font-weight: bold; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .kpi { background-color: #F8F9FA; border: 1px solid #E2E8F0; border-radius: 8px; padding: 15px; }
            .kpi-title { font-size: 11px; text-transform: uppercase; color: #718096; }
            .kpi-val { font-size: 20px; font-weight: bold; margin-top: 5px; color: #0A192F; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #0A192F; color: white; padding: 10px; text-align: left; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <div class="header">
            <div>
              <div class="brand">GOLDEN BOUTIQUE</div>
              <div class="report-title">REPORTE DE PEDIDOS COMPRA - ${rangeText}</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #718096;">
              Generado: ${dateText}<br>
              Moneda: USD ($)
            </div>
          </div>

          <div class="grid">
            <div class="kpi">
              <div class="kpi-title">Inversión / Gasto Total</div>
              <div class="kpi-val">$${totalExpenditure.toFixed(2)}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Pedidos Registrados</div>
              <div class="kpi-val">${totalOrders}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Monto Promedio</div>
              <div class="kpi-val">$${averageTicket.toFixed(2)}</div>
            </div>
          </div>

          <h3>Detalle de Pedidos de Compra</h3>
          <table>
            <thead>
              <tr>
                <th style="padding:10px;">ID Pedido</th>
                <th style="padding:10px;">Empresa</th>
                <th style="padding:10px;">Vendedor / Contacto</th>
                <th style="padding:10px;">Detalle / Descripción</th>
                <th style="padding:10px;text-align:right;">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#718096;">No hay pedidos registrados en este lapso.</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // EXPORT TO EXCEL (CSV Generator)
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Numero de Pedido,Empresa Proveedora,Nombre Vendedor,Telefono Contacto,Descripcion Solicitud,Gasto Total,Registrado Por,Fecha\n";

    filteredOrders.forEach(o => {
      const row = [
        o.order_number,
        `"${o.company_name.replace(/"/g, '""')}"`,
        `"${o.seller_name.replace(/"/g, '""')}"`,
        `"${o.seller_phone}"`,
        `"${(o.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        o.total_value,
        `"${o.created_by_name}"`,
        o.created_at
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_compras_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      
      {/* Header title */}
      <div>
        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-accent)', fontWeight: 800 }}>Reportes de Compra</h2>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Métricas e informes de inversión en mercadería</p>
      </div>

      {/* Date Selectors Tabs Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        backgroundColor: 'var(--bg-secondary)', 
        borderRadius: 'var(--radius-md)',
        padding: '4px',
        border: '1px solid var(--border-color)'
      }}>
        {[
          { key: 'diario', label: 'Diario' },
          { key: 'semanal', label: 'Semanal' },
          { key: 'mensual', label: 'Mensual' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setReportType(item.key)}
            style={{
              padding: '10px 0',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: reportType === item.key ? 'var(--primary-color)' : 'transparent',
              color: reportType === item.key ? 'white' : 'var(--text-secondary)',
              transition: 'var(--transition-smooth)'
            }}
            className="animated-scale"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Primary metrics numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        
        {/* Total Revenues */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={12} style={{ color: 'var(--gold-color)' }} /> Inversión Total
          </span>
          <strong style={{ fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-accent)' }}>
            ${totalExpenditure.toFixed(2)}
          </strong>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{totalOrders} pedido(s)</span>
        </div>

        {/* Profit margins */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShoppingCart size={12} style={{ color: 'var(--status-prep)' }} /> Costo Promedio
          </span>
          <strong style={{ fontSize: '18px', color: 'var(--status-prep)', fontFamily: 'var(--font-accent)' }}>
            ${averageTicket.toFixed(2)}
          </strong>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Por orden emitida</span>
        </div>
      </div>

      {/* Export operations buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        <button 
          onClick={exportToPDF}
          className="btn btn-secondary animated-scale"
          style={{ fontSize: '12px', padding: '10px 14px' }}
        >
          <FileText size={16} style={{ color: 'var(--gold-color)' }} />
          Exportar PDF
        </button>
        <button 
          onClick={exportToExcel}
          className="btn btn-secondary animated-scale"
          style={{ fontSize: '12px', padding: '10px 14px' }}
        >
          <Download size={16} style={{ color: 'var(--status-prep)' }} />
          Exportar Excel
        </button>
      </div>

      {/* Sales breakdown by Company */}
      <div className="card">
        <h3 style={{ fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontFamily: 'var(--font-accent)' }}>
          <Store size={14} style={{ color: 'var(--gold-color)' }} />
          Gasto por Empresa Proveedora
        </h3>

        {companyBreakdown.length === 0 ? (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            No hay registros de compras en este rango
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {companyBreakdown.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                padding: '6px 0',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pedidos de Compra: {item.count}</div>
                </div>
                <strong style={{ color: 'var(--text-secondary)' }}>${item.revenue.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sales breakdown by Seller */}
      <div className="card">
        <h3 style={{ fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontFamily: 'var(--font-accent)' }}>
          <Users size={14} style={{ color: 'var(--gold-color)' }} />
          Adquisiciones por Vendedor
        </h3>

        {sellerBreakdown.length === 0 ? (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            No hay transacciones registradas
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sellerBreakdown.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                padding: '6px 0',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Empresa: {item.company}</div>
                </div>
                <strong style={{ color: 'var(--gold-color)' }}>${item.revenue.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
