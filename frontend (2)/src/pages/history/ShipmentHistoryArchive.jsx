import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ResponsiveTable } from '../../components/tables/ResponsiveTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { History, Download, FileSpreadsheet, Eye, ArrowRight, Filter } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';

export const ShipmentHistoryArchive = ({ onNavigate }) => {
  const { shipments } = useAppData();
  const { showToast } = useToast();

  const handleExportArchiveCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Shipment Number,Tracking Number,Origin,Destination,Vessel,Voyage,Container,Packages,Weight (LBS),CBM,Status,B/L Status,ETD,ETA\r\n";

    shipments.forEach(s => {
      const row = [
        `"${s.shipmentNumber}"`,
        `"${s.trackingNumber}"`,
        `"${s.origin}"`,
        `"${s.destinationPort}"`,
        `"${s.vesselName}"`,
        `"${s.voyageNumber}"`,
        `"${s.containerNumber}"`,
        s.totalPackages,
        s.totalWeightLbs,
        s.totalCbm,
        `"${s.status}"`,
        `"${s.blStatus}"`,
        `"${s.etd}"`,
        `"${s.eta}"`
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KERS_Shipment_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported historical shipments archive to CSV.`, 'success', 'Report Exported');
  };

  const columns = [
    {
      header: 'Shipment #',
      accessor: 'shipmentNumber',
      render: (item) => (
        <div>
          <strong style={{ color: '#0A192F', fontFamily: 'JetBrains Mono, monospace' }}>{item.shipmentNumber}</strong>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.createdDate}</div>
        </div>
      )
    },
    {
      header: 'Route',
      accessor: 'destinationPort',
      render: (item) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0A192F' }}>{item.destinationPort}</span>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>From {item.origin}</div>
        </div>
      )
    },
    {
      header: 'Vessel / Container',
      accessor: 'vesselName',
      render: (item) => (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.vesselName}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.containerNumber}</div>
        </div>
      )
    },
    {
      header: 'Total Volume',
      accessor: 'totalCbm',
      render: (item) => (
        <div>
          <strong>{item.totalCbm} CBM</strong>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.totalPackages} pkgs</div>
        </div>
      )
    },
    {
      header: 'Departure / Arrival',
      accessor: 'etd',
      render: (item) => (
        <div style={{ fontSize: '0.78rem' }}>
          <div>Dep: {item.etd}</div>
          <div style={{ color: '#0284C7' }}>Arr: {item.eta}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('shipments', item.id);
          }}
          className="btn btn-sm btn-outline"
          style={{ padding: '0.25rem 0.5rem' }}
        >
          <Eye size={13} />
          <span>View</span>
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Shipment History &amp; Historical Archive"
        subtitle="Search historical consignments, filter by date ranges, destination, vessel, and export summaries."
        icon={History}
        breadcrumbs={[
          { label: 'Reports', href: '#' },
          { label: 'Shipment History' }
        ]}
        actions={
          <button onClick={handleExportArchiveCsv} className="btn btn-outline btn-sm">
            <FileSpreadsheet size={15} style={{ color: '#059669' }} />
            <span>Export Archive (CSV)</span>
          </button>
        }
      />

      <ResponsiveTable
        columns={columns}
        data={shipments}
        searchPlaceholder="Search history by shipment #, vessel, destination..."
        filterOptions={['All', 'Delivered', 'In Transit', 'Loaded & Sealed']}
        pageSize={8}
        onRowClick={(item) => onNavigate('shipments', item.id)}
      />
    </div>
  );
};
